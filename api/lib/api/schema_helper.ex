defmodule Api.SchemaHelper do
  @doc """
  Returns the schema prefix when using Postgres, nil otherwise.
  """
  def schema_prefix do
    if using_postgres?(), do: get_db_schema(), else: nil
  end

  @doc """
  Applies the schema prefix to queries when using Postgres.
  """
  def with_prefix(query) do
    if using_postgres?() do
      %{query | prefix: get_db_schema()}
    else
      query
    end
  end

  defp using_postgres? do
    Application.get_env(:api, :adapter) == Ecto.Adapters.Postgres
  end

  defp get_db_schema do
    System.get_env("DB_SCHEMA") || "vyre"
  end
end
