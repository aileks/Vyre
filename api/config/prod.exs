import Config

config :api, Api.Accounts.Guardian, secret_key: System.get_env("GUARDIAN_SECRET_KEY")

# Do not print debug messages in production
config :logger, level: :info

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.
config :api, Api.Repo,
  adapter: Ecto.Adapters.Postgres,
  ssl: true,
  ssl: [
    cacertfile: "/etc/ssl/certs/ca-certificates.crt"
  ],
  url: database_url,
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  socket_options: maybe_ipv6,
  timeout: 30_000
