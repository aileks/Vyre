FROM elixir:1.18 AS build

RUN mix local.hex --force && \
    mix local.rebar --force

WORKDIR /app

COPY mix.exs mix.lock ./
RUN mix deps.get

COPY . .
RUN mix compile

ENV MIX_ENV=prod
RUN mix release

FROM alpine:3.16

RUN apk add --no-cache openssl ncurses-libs

WORKDIR /app

COPY --from=build /app/_build/prod/rel/api ./

EXPOSE 4000

CMD ["bin/api", "start"]
