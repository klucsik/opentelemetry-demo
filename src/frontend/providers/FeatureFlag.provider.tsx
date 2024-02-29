// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ApiGateway from '../gateways/Api.gateway';
import { Flag } from '../protos/demo';



interface IContext {
  featureFlag: Flag;
}


export const Context = createContext<IContext>({
  featureFlag: {} as Flag
});

interface IProps {
  children: React.ReactNode;
  queryFlagName: string;
}

export const useFeatureFlag = () => useContext(Context);

const FeatureFlagProvider = ({ children, queryFlagName }: IProps) => {


  const { data: flagResponse } = useQuery(
    ["flagName", queryFlagName],
    () => {
      return ApiGateway.getFlag(queryFlagName);
    }
  );

  const value = useMemo(
    () => ({
      featureFlag: flagResponse as Flag
    }),
    [flagResponse]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default FeatureFlagProvider;
