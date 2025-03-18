import Config

config :api,
  ecto_repos: [Api.Repo],
  generators: [timestamp_type: :utc_datetime, binary_id: true]

# Configures the endpoint
config :api, ApiWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  # server: true,
  render_errors: [
    formats: [json: ApiWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Api.PubSub,
  live_view: [signing_salt: "k3W7Q6qB"]

config :api, ApiWeb.Auth.Guardian,
  issuer: "api",
  secret_key: System.get_env("GUARDIAN_SECRET_KEY"),
  allowed_algos: ["HS512"],
  verify_issuer: true,
  hooks: Guardian.DB

config :guardian, Guardian.DB,
  repo: Api.Repo,
  schema_name: "guardian_tokens",
  prefix: System.get_env("DB_SCHEMA"),
  token_types: ["access", "refresh"],
  sweep_interval: 60

# Set up CORS
config :cors_plug,
  origin: ["http://localhost:4000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  headers: ["Authorization", "Content-Type", "Accept", "Origin", "User-Agent"],
  credentials: true,
  max_age: 86400

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
