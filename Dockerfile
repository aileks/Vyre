FROM elixir:1.18-alpine

ARG MIX_ENV
ARG GUARDIAN_SECRET_KEY
ARG DATABASE_URL
ARG DB_SCHEMA

RUN apk add --no-cache build-base openssl ncurses-libs postgresql-dev postgresql-client \
    libstdc++ ca-certificates curl
RUN curl -s -o /etc/ssl/certs/prod-ca-2021.crt https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt && \
    chmod 644 /etc/ssl/certs/prod-ca-2021.crt && \
    update-ca-certificates

WORKDIR /app

COPY backend/mix.exs backend/mix.lock ./

RUN mix deps.get --only prod

COPY backend/ ./

RUN mix deps.compile
RUN mix ecto.migrate --prefix ${DB_SCHEMA}
RUN mix phx.digest
RUN mix release

EXPOSE 4000

CMD ["/app/_build/prod/rel/api/bin/api", "start"]
