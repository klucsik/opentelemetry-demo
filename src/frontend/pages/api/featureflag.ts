// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import type { NextApiRequest, NextApiResponse } from 'next';
import InstrumentationMiddleware from '../../utils/telemetry/InstrumentationMiddleware';
import FfsGateway from '../../gateways/rpc/FeatureFlag.gateway';
import { Flag } from '../../protos/demo';

type TResponse = Flag;

const handler = async ({ method, query }: NextApiRequest, res: NextApiResponse<TResponse>) => {
  switch (method) {
    case 'GET': {
      const { flagName = '' } = query;
      const { flag } = await FfsGateway.getFlag(flagName as string);

      return res.status(200).json(flag as Flag);
    }

    default: {
      return res.status(405);
    }
  }
};

export default InstrumentationMiddleware(handler);
