defmodule Api.Servers.Server do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "servers" do
    field(:name, :string)
    field(:description, :string)
    field(:icon_url, :string)
    field(:created_at, :utc_datetime)
    timestamps(type: :utc_datetime)

    belongs_to(:owner, Api.Accounts.User, foreign_key: :owner_id)
  end

  @doc false
  def changeset(server, attrs) do
    server
    |> cast(attrs, [:name, :description, :icon_url, :created_at])
    |> validate_required([:name, :description, :icon_url, :created_at])
    |> unique_constraint(:name)
  end
end
