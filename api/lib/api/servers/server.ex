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
    field(:owner_id, :binary_id)

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(server, attrs) do
    server
    |> cast(attrs, [:name, :description, :icon_url, :created_at])
    |> validate_required([:name, :description, :icon_url, :created_at])
    |> unique_constraint(:name)
  end
end
