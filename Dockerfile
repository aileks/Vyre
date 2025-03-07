FROM elixir:1.18-alpine AS build

RUN apk add build-base
RUN apk add openssl ncurses-libs postgresql-dev gcc musl-dev

WORKDIR /app

COPY api/mix.exs api/mix.lock ./

ENV MIX_ENV=prod
RUN mix deps.get --only prod

COPY api/ ./

RUN echo "MIX_ENV is $MIX_ENV"
RUN mix phx.compile
RUN mix phx.digest

RUN mix release

COPY --from=build /app/_build/prod/rel/api ./

EXPOSE 4000

CMD ["bin/api", "start"]
