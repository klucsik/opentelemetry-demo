# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0


FROM python:3.12-slim-bookworm as base

FROM base as builder
RUN apt-get -qq update \
    && apt-get install -y --no-install-recommends g++ \
    && rm -rf /var/lib/apt/lists/*

COPY ./src/loadgenerator/requirements.txt .
RUN pip install --prefix="/reqs" -r requirements.txt


# Build gRPC files
FROM base as grpc-builder
WORKDIR /usr/src/app/
COPY ./pb/ ./proto/

RUN python -m pip install grpcio-tools==1.59.2
RUN python -m grpc_tools.protoc -I=./proto/ --python_out=./ --grpc_python_out=./ ./proto/demo.proto

FROM base
WORKDIR /usr/src/app/
COPY --from=builder /reqs /usr/local
COPY ./src/loadgenerator/locustfile.py .
COPY ./src/loadgenerator/people.json .
COPY --from=grpc-builder /usr/src/app/ .

ENV LOCUST_PLAYWRIGHT=1
RUN playwright install --with-deps chromium
ENTRYPOINT locust
