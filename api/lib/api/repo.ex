defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: if(Mix.env() == :prod, do: Ecto.Adapters.Postgres, else: Ecto.Adapters.SQLite3)

  def init(_type, config) do
    if config[:adapter] == Ecto.Adapters.Postgres do
      db_schema = System.get_env("DB_SCHEMA") || "vyre"

      config =
        config
        |> Keyword.put(:search_path, [db_schema, "public"])
        |> Keyword.put(:after_connect, {__MODULE__, :set_search_path, [db_schema]})
        |> Keyword.update(:parameters, %{search_path: db_schema}, fn params ->
          Map.put(params, "search_path", db_schema)
        end)
        |> Keyword.put(:migration_source, "schema_migrations")
        |> Keyword.put(:migration_default_prefix, db_schema)

      {:ok, config}
    else
      {:ok, config}
    end
  end

  @doc """
  Sets the search path for PostgreSQL connections.
  This ensures queries run in the correct schema.
  """
  def set_search_path(conn, schema) do
    Postgrex.query!(conn, "SET search_path TO #{schema},public", [])
  end

  @doc """
  Creates the schema and migrations table if they don't exist.
  Should be called before running migrations in production.
  """
  def ensure_schema_exists do
    if Mix.env() == :prod do
      db_schema = System.get_env("DB_SCHEMA") || "vyre"

      # Connect with base configuration (without search_path restrictions)
      config = config()
      base_config = Keyword.drop(config, [:search_path, :after_connect, :parameters])

      case Postgrex.start_link(base_config) do
        {:ok, conn} ->
          # Create schema
          Postgrex.query!(conn, "CREATE SCHEMA IF NOT EXISTS #{db_schema}", [])

          # Create migrations table in the schema
          Postgrex.query!(
            conn,
            """
            CREATE TABLE IF NOT EXISTS #{db_schema}.schema_migrations (
              version bigint PRIMARY KEY,
              inserted_at timestamptz NOT NULL DEFAULT now()
            )
            """,
            []
          )

          GenServer.stop(conn)
          :ok

        error ->
          IO.warn("Failed to create schema: #{inspect(error)}")
          :error
      end
    else
      :ok
    end
  rescue
    e ->
      IO.warn("Error ensuring schema exists: #{inspect(e)}")
      :error
  end
end
