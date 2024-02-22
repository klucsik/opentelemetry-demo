// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
const {context, propagation, trace, metrics} = require('@opentelemetry/api');
const cardValidator = require('simple-card-validator');
const { v4: uuidv4 } = require('uuid');

const logger = require('./logger');
const tracer = trace.getTracer('paymentservice');
const meter = metrics.getMeter('paymentservice');
const transactionsCounter = meter.createCounter('app.payment.transactions')

let grpc = require('@grpc/grpc-js');
let protoLoader = require('@grpc/proto-loader');
let protoDescriptor = grpc.loadPackageDefinition(protoLoader.loadSync('demo.proto'));
let client = new protoDescriptor.oteldemo.FeatureFlagService (
    process.env.FEATURE_FLAG_GRPC_SERVICE_ADDR,
    grpc.credentials.createInsecure()
);

async function getFeatureFlagEnabled(featureFlag) {
  try {
    const response = await new Promise((resolve, reject) => {
      client.getFlag({ name: featureFlag }, (error, response) => {
        error ? reject(error) : resolve(response);
      });
    });

    return response.flag?.enabled || false;
  } catch (error) {
    logger.error(`Error getting FeatureFlag: ${error}`);
  }
}

module.exports.charge = async request => {
  const span = tracer.startSpan('charge');

  if (await getFeatureFlagEnabled("paymentServiceFailure")) {
    throw new Error("PaymentService Fail Feature Flag Enabled");
  }

  const {
    creditCardNumber: number,
    creditCardExpirationYear: year,
    creditCardExpirationMonth: month
  } = request.creditCard;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const lastFourDigits = number.substr(-4);
  const transactionId = uuidv4();

  const card = cardValidator(number);
  const { card_type: cardType, valid } = card.getCardDetails();

  span.setAttributes({
    'app.payment.card_type': cardType,
    'app.payment.card_valid': valid
  });

  if (!valid) {
    throw new Error('Credit card info is invalid.');
  }

  if (!['visa', 'mastercard'].includes(cardType)) {
    throw new Error(`Sorry, we cannot process ${cardType} credit cards. Only VISA or MasterCard is accepted.`);
  }

  if ((currentYear * 12 + currentMonth) > (year * 12 + month)) {
    throw new Error(`The credit card (ending ${lastFourDigits}) expired on ${month}/${year}.`);
  }

  // check baggage for synthetic_request=true, and add charged attribute accordingly
  const baggage = propagation.getBaggage(context.active());
  if (baggage && baggage.getEntry("synthetic_request") && baggage.getEntry("synthetic_request").value === "true") {
    span.setAttribute('app.payment.charged', false);
  } else {
    span.setAttribute('app.payment.charged', true);
  }

  span.end();

  const { units, nanos, currencyCode } = request.amount;
  logger.info({transactionId, cardType, lastFourDigits, amount: { units, nanos, currencyCode }}, "Transaction complete.");
  transactionsCounter.add(1, {"app.payment.currency": currencyCode})
  return { transactionId }
}
