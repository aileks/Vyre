# ---------------------------
# Stage 1: Build the release
# ---------------------------
FROM elixir:1.18-alpine AS build

ARG MIX_ENV
ARG GUARDIAN_SECRET_KEY
ARG DATABASE_URL
ARG SCHEMA

RUN apk add build-base openssl ncurses-libs postgresql-dev

WORKDIR /app

COPY api/mix.exs api/mix.lock ./

RUN mix deps.get --only prod

COPY api/ ./

RUN echo "MIX_ENV is $MIX_ENV"
RUN mix deps.compile
RUN mix phx.digest

RUN mix release

# ---------------------------
# Stage 2: Runtime environment
# ---------------------------
FROM alpine:3.21

RUN apk add --no-cache openssl ncurses-libs postgresql-dev postgresql-client libstdc++ curl ca-certificates
RUN curl -s -o /etc/ssl/certs/prod-ca-2021.crt https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt && \
    chmod 644 /etc/ssl/certs/prod-ca-2021.crt && \
    update-ca-certificates

WORKDIR /app

COPY --from=build /app/_build/prod/rel/api /app


EXPOSE 4000

CMD ["bin/api", "start"]
