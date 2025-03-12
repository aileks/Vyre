defmodule Api.Servers.Server do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "servers" do
    field(:name, :string)
    field(:description, :string)
    field(:icon_url, :string)
    field(:created_at, :utc_datetime, default: DateTime.utc_now() |> DateTime.truncate(:second))
    timestamps(type: :utc_datetime)

    belongs_to(:owner, Api.Accounts.User)
    has_many(:channels, Api.Channels.Channel)
    has_many(:roles, Api.Roles.Role)
    has_many(:server_members, Api.Servers.ServerMember)
    has_many(:users, through: [:server_members, :user])
  end

  def changeset(server, attrs) do
    server
    |> cast(attrs, [:name, :description, :icon_url, :owner_id])
    |> validate_required([:name, :owner_id])
    |> validate_length(:name, min: 3, max: 100)
    |> validate_length(:description, max: 1000)
    |> foreign_key_constraint(:owner_id)
    |> unique_constraint(:name)
  end

  def update_changeset(server, attrs) do
    server
    |> cast(attrs, [:name, :description, :icon_url])
    |> validate_required([:name])
    |> validate_length(:name, min: 3, max: 100)
    |> validate_length(:description, max: 1000)
    |> unique_constraint(:name)
  end
end
