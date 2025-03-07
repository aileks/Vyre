defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: if(Mix.env() == :prod, do: Ecto.Adapters.Postgres, else: Ecto.Adapters.SQLite3)

  def init(_type, config) do
    config =
      Keyword.put(
        config,
        :url,
        System.get_env("DATABASE_URL") || Keyword.get(config, :url)
      )

    {:ok, config}
  end
end
