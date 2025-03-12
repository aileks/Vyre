defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: if(Mix.env() == :prod, do: Ecto.Adapters.Postgres, else: Ecto.Adapters.SQLite3)

  def init(_type, config) do
    if config[:adapter] == Ecto.Adapters.Postgres do
      db_schema = System.get_env("DB_SCHEMA") || "vyre"

      config =
        config
        |> Keyword.put(:search_path, [db_schema])
        |> Keyword.update(:parameters, [search_path: db_schema], fn params ->
          Keyword.put_new(params, :search_path, db_schema)
        end)
        |> Keyword.put(:migration_source, "vyre_schema_migrations")
        |> Keyword.put(:migration_default_prefix, db_schema)

      {:ok, config}
    else
      {:ok, config}
    end
  end
end
