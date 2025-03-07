FROM elixir:1.18-alpine AS build

# RUN mix local.hex --force && mix local.rebar --force

WORKDIR /app

COPY api/mix.exs api/mix.lock ./
RUN mix deps.get --only prod

COPY api/ ./

RUN mix phx.compile
RUN mix phx.digest

ENV MIX_ENV=prod
RUN mix release

FROM alpine:3.21
RUN apk add --no-cache openssl ncurses-libs

WORKDIR /app

COPY --from=build /app/_build/prod/rel/api ./

EXPOSE 4000

CMD ["bin/api", "start"]
