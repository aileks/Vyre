defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: if(Mix.env() == :prod, do: Ecto.Adapters.Postgres, else: Ecto.Adapters.SQLite3)

  def init(_type, config) do
    if config[:adapter] == Ecto.Adapters.Postgres do
      db_schema = System.get_env("DB_SCHEMA") || "vyre"

      parameters = Map.new(config[:parameters] || %{})
      parameters = Map.put(parameters, "search_path", "#{db_schema},public")

      config =
        config
        |> Keyword.put(:after_connect, {__MODULE__, :set_search_path, [db_schema]})
        |> Keyword.put(:parameters, parameters)
        |> Keyword.put(:migration_source, "schema_migrations")
        |> Keyword.put(:migration_default_prefix, db_schema)

      {:ok, config}
    else
      {:ok, config}
    end
  end
end
