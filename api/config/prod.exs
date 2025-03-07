import Config

config :api, Api.Accounts.Guardian, secret_key: System.get_env("GUARDIAN_SECRET_KEY")

# Do not print debug messages in production
config :logger, level: :info

config :api, Api.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: database_url,
  ipv6: maybe_ipv6,
  ssl: [
    verify: :verify_peer,
    cacertfile: "/etc/ssl/certs/prod-ca-2021.crt",
    server_name_indication: String.to_charlist(URI.parse(System.get_env("DATABASE_URL")).host)
  ],
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  timeout: 30000,
  queue_target: 5000,
  queue_interval: 5000
