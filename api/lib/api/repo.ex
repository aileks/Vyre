defmodule Api.Repo do
  use Ecto.Repo,
    otp_app: :api,
    adapter: if(Mix.env() == :prod, do: Ecto.Adapters.Postgres, else: Ecto.Adapters.SQLite3)
end
