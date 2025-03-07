FROM elixir:1.18-alpine as build
FROM alpine:3.21

RUN apk add build-base
RUN apk add openssl ncurses-libs postgresql-dev

ARG MIX_ENV
ARG GUARDIAN_SECRET_KEY
ARG DATABASE_URL
ARG SCHEMA

WORKDIR /app

COPY api/mix.exs api/mix.lock ./

RUN mix deps.get --only prod

COPY api/ ./

RUN echo "MIX_ENV is $MIX_ENV"
RUN mix phx.compile
RUN mix phx.digest

RUN mix release

COPY --from=build /app/_build/prod/rel/api ./

EXPOSE 4000

CMD ["bin/api", "start"]
