defmodule Vyre.Repo do
  use Ecto.Repo,
    otp_app: :vyre,
    adapter: Ecto.Adapters.SQLite3
end
