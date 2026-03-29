# Multi-stage: Actix BFF (binary name: matchmyresume-bff)
FROM rust:1-bookworm AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY migrations ./migrations
COPY configuration.yaml ./configuration.yaml
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libssl3 wget \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/matchmyresume-bff /app/matchmyresume-bff
COPY --from=builder /app/configuration.yaml /app/configuration.yaml
COPY migrations ./migrations
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/api/v1/health > /dev/null || exit 1
CMD ["/app/matchmyresume-bff"]
