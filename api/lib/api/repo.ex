defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: if(Mix.env() == :prod, do: Ecto.Adapters.Postgres, else: Ecto.Adapters.SQLite3)

  def init(_type, config) do
    if config[:adapter] == Ecto.Adapters.Postgres do
      db_schema = System.get_env("DB_SCHEMA") || "vyre"
      IO.puts("Using schema: #{db_schema}")

      Keyword.update(config, :parameters, [search_path: db_schema], fn params ->
        Keyword.put_new(params, :search_path, db_schema)
      end)
    else
      config
    end
    |> then(&{:ok, &1})
  end
end
