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
COPY api/priv/certs/supabase.crt ./

RUN echo "MIX_ENV is $MIX_ENV"
RUN mix deps.compile
RUN mix phx.digest

RUN mix release

# ---------------------------
# Stage 2: Runtime environment
# ---------------------------
FROM alpine:3.21

RUN apk add --no-cache openssl ncurses-libs postgresql-dev libstdc++ curl

WORKDIR /app

COPY --from=build /app/_build/prod/rel/api /app


EXPOSE 4000

CMD ["bin/api", "start"]
