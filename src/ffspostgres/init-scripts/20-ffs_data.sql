-- Copyright The OpenTelemetry Authors
-- SPDX-License-Identifier: Apache-2.0

-- Feature Flags created and initialized on startup
INSERT INTO public.featureflags (name, description, enabled)
VALUES
    ('productCatalogFailure', 'Fail product catalog service on a specific product', 0),
    ('recommendationCache', 'Cache recommendations', 0),
    ('adServiceFailure', 'Fail ad service requests', 0),
    ('adServiceHighCpu', 'Enables high CPU problem pattern', 0),
    ('cartServiceFailure', 'Fail cart service requests', 0),
    ('paymentServiceFailure', 'Fail payment service charge requests', 0),
    ('paymentServiceUnreachable', 'Payment service is unavailable', 0),
    ('adServiceManualGc', 'Triggers a full manual gc in the ad service', 0),
    ('itemListInternal', 'Fail Product Catalog List - Internal server error', 0),
    ('itemNotFound', 'Fail Product Catalog Get - Not Found', 0),
    ('floodHome', 'Flood Homepage with unreasonable amount of traffic', 0);