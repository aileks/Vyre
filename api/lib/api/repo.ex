defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: if(Mix.env() == :prod, do: Ecto.Adapters.Postgres, else: Ecto.Adapters.SQLite3)

  def init(_type, config) do
    updated_config =
      if config[:adapter] == Ecto.Adapters.Postgres do
        Keyword.update(config, :parameters, [search_path: "vyre"], fn params ->
          Keyword.put_new(params, :search_path, "vyre")
        end)
      else
        config
      end

    {:ok, updated_config}
  end
end
