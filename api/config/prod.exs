import Config

config :api, Api.Accounts.Guardian, secret_key: System.get_env("GUARDIAN_SECRET_KEY")

# Do not print debug messages in production
config :logger, level: :info

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.
config :api, Api.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL") || raise("DATABASE_URL is missing"),
  ssl: false,
  # ssl: [
  #   verify: :verify_peer,
  #   cacertfile: "/etc/ssl/certs/prod-ca-2021.crt",
  #   versions: [:"tlsv1.3"],
  #   reuse_sessions: true
  # ],
  parameters: [
    search_path: System.get_env("SCHEMA") || "vyre"
  ],
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "20"),
  timeout: 30000,
  pool_timeout: 30000,
  queue_interval: 5000,
  queue_target: 3000,
  connect_timeout: 45000,
  idle_interval: 60000,
  backoff_type: :exp,
  backoff_min: 1000,
  backoff_max: 30000,
  show_sensitive_data_on_connection_error: false
