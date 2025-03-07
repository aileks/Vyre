import Config

# Do not print debug messages in production
config :logger, level: :warn

config :bcrypt_elixir, :log_rounds, 12
