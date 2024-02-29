// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Image from "next/image"
import { useFeatureFlag } from '../../providers/FeatureFlag.provider';
import * as S from './ExternalImage.styled';

const ExternalImage = () => {

    const { featureFlag } = useFeatureFlag();

    if (featureFlag != undefined && featureFlag.enabled) {
        return (

            <S.ExternalImage>
                <Image
                    src="https://opentelemetry.io/img/logos/opentelemetry-horizontal-color.svg"
                    width={123}
                    height={43}
                    unoptimized
                />
                <p>{featureFlag.name} feature flag is enabled. 
                Above picture will be loaded from external domain (opentelemetry.io) with every reload.</p>

            </S.ExternalImage>
        );
    }
};

export default ExternalImage;