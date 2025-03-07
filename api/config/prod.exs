import Config

config :api, Api.Accounts.Guardian, secret_key: System.get_env("GUARDIAN_SECRET_KEY")

# Do not print debug messages in production
config :logger, level: :info

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.
config :api, Api.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL") || raise("DATABASE_URL is missing"),
  ssl: [
    verify: :verify_peer,
    cacertfile: "/etc/ssl/certs/prod-ca-2021.crt"
  ],
  parameters: [
    search_path: System.get_env("SCHEMA") || "vyre"
  ]
