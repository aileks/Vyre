FROM 1.17-alpine

RUN apk add --no-cache build-base openssl ncurses-libs postgresql-dev

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

EXPOSE 4000

CMD ["bin/api", "start"]
