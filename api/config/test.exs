import Config

if File.exists?("../.env") do
  Dotenv.load("../.env")
end

config :api, Api.Auth.Guardian,
  issuer: "api",
  secret_key: System.get_env("GUARDIAN_SECRET_KEY")

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :api, Api.Repo,
  database: Path.expand("../database/test.db", Path.dirname(__ENV__.file)),
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :api, ApiWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "7jS7pBSbN19v2PPGfJIGvQuQ91KEnZNz2lg+VYZrLgKqW/FIRWFVfxeUa4EMy43Y",
  server: false

# In test we don't send emails
# config :api, Api.Mailer, adapter: Swoosh.Adapters.Test
config :api, Api.Repo, adapter: Ecto.Adapters.SQLite3

# Disable swoosh api client as it is only required for production adapters
# config :swoosh, :api_client, false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
