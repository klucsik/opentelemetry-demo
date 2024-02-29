// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { ChannelCredentials } from '@grpc/grpc-js';
import { GetFlagResponse, FeatureFlagServiceClient } from '../../protos/demo';

const { FEATURE_FLAG_GRPC_SERVICE_ADDR = '' } = process.env;

const client = new FeatureFlagServiceClient(FEATURE_FLAG_GRPC_SERVICE_ADDR, ChannelCredentials.createInsecure());

const FfsGateway = () => ({
  getFlag(flagName: string) {
    return new Promise<GetFlagResponse>((resolve, reject) =>
      client.getFlag({ name: flagName }, (error, response) => (error ? reject(error) : resolve(response)))
    );
  },
});

export default FfsGateway();
