// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { CypressFields } from '../../utils/Cypress';
import { Product } from '../../protos/demo';
import ProductCard from '../ProductCard';
import * as S from './ProductList.styled';
import { OpenFeatureProvider, OpenFeature } from '@openfeature/react-sdk';

interface IProps {
  productList: Product[];
}

const ProductList = ({ productList }: IProps) => {
  const client = OpenFeature.getClient();
  return (
    <OpenFeatureProvider client={client}>
      <S.ProductList data-cy={CypressFields.ProductList}>
        {productList.map(product => (
            <ProductCard key={product.id} product={product} />
        ))}
      </S.ProductList>
    </OpenFeatureProvider>
  );
};

export default ProductList;
