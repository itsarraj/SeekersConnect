# Multi-stage build: Actix auth service (binary name: uas)
FROM rust:1-bookworm AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY migrations ./migrations
COPY configuration.yaml ./configuration.yaml
ENV CARGO_BUILD_JOBS=1
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libssl3 wget \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/uas /app/uas
COPY --from=builder /app/configuration.yaml /app/configuration.yaml
COPY migrations ./migrations
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8000/api/v1/health > /dev/null || exit 1
CMD ["/app/uas"]
