let grpc = require('@grpc/grpc-js');
let protoLoader = require('@grpc/proto-loader');
let protoDescriptor = grpc.loadPackageDefinition(protoLoader.loadSync('demo.proto'));
let client = new protoDescriptor.oteldemo.FeatureFlagService (
    process.env.FEATURE_FLAG_GRPC_SERVICE_ADDR,
    grpc.credentials.createInsecure()
);

module.exports.getFeatureFlagEnabled = async featureFlag => {
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