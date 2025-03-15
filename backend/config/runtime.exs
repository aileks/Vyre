import Config

if System.get_env("PHX_SERVER") do
  config :api, ApiWeb.Endpoint, server: true
end

if config_env() == :prod do
  config :bcrypt_elixir, :log_rounds, 4

  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  config :api, Api.Repo,
    adapter: Ecto.Adapters.Postgres,
    url: database_url,
    ssl: [
      verify: :verify_peer,
      cacertfile: "/etc/ssl/certs/prod-ca-2021.crt",
      server_name_indication: String.to_charlist(URI.parse(System.get_env("DATABASE_URL")).host)
    ],
    pool_size: 5,
    queue_target: 5000,
    queue_interval: 5000

  guardian_secret_key =
    System.get_env("GUARDIAN_SECRET_KEY") ||
      if config_env() in [:dev, :test] do
        "insecure_key_for_dev_environment_only"
      else
        raise """
        environment variable GUARDIAN_SECRET_KEY is missing.
        You can generate one by calling: mix phx.gen.secret 32
        """
      end

  # config :api, Api.Auth.Guardian,
  #   issuer: "api",
  #   secret_key: guardian_secret_key

  host = System.get_env("PHX_HOST") || "vyre.app"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :api, :dns_cluster_query, System.get_env("DNS_CLUSTER_QUERY")

  config :api, ApiWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: guardian_secret_key
else
  config :bcrypt_elixir, :log_rounds, 4
end
