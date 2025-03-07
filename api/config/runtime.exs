import Config

config :logger, level: :info

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.

# ## Using releases
#
# If you use `mix release`, you need to explicitly enable the server
# by passing the PHX_SERVER=true when you start it:
#
#     PHX_SERVER=true bin/api start
#
# Alternatively, you can use `mix phx.gen.release` to generate a `bin/server`
# script that automatically sets the env var above.
if System.get_env("PHX_SERVER") do
  config :api, ApiWeb.Endpoint, server: true
end

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  maybe_ipv6 = if System.get_env("ECTO_IPV6") in ~w(true 1), do: [:inet6], else: []

  config :api, Api.Repo,
    adapter: Ecto.Adapters.Postgres,
    url: database_url,
    ipv6: maybe_ipv6,
    ssl: [
      verify: :verify_peer,
      cacertfile: "/etc/ssl/certs/prod-ca-2021.crt",
      server_name_indication: String.to_charlist(URI.parse(System.get_env("DATABASE_URL")).host)
    ],
    pool_size: 10,
    timeout: 30000

  guardian_secret_key =
    System.get_env("GUARDIAN_SECRET_KEY") ||
      raise """
      environment variable GUARDIAN_SECRET_KEY is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  config :api, Api.Accounts.Guardian,
    issuer: "api",
    secret_key: guardian_secret_key

  host = System.get_env("PHX_HOST") || "vyre.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :api, :dns_cluster_query, System.get_env("DNS_CLUSTER_QUERY")

  config :api, ApiWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: guardian_secret_key
end
