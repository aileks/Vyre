defmodule Api.Roles.Role do
  use Ecto.Schema
  import Ecto.Changeset

  @schema_prefix System.get_env("DB_SCHEMA")
  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "roles" do
    field(:name, :string)
    field(:position, :integer)
    field(:permissions, :integer)
    field(:color, :string)
    field(:hoist, :boolean, default: false)
    field(:mentionable, :boolean, default: false)
    timestamps(type: :utc_datetime)

    belongs_to(:server, Api.Servers.Server, foreign_key: :server_id)
    many_to_many(:users, Api.Accounts.User, join_through: Api.Roles.UserRole)
  end

  def changeset(role, attrs) do
    role
    |> cast(attrs, [:name, :color, :permissions, :position, :hoist, :mentionable, :server_id])
    |> validate_required([:name, :color, :permissions, :position, :server_id])
    |> foreign_key_constraint(:server_id)
  end

  def update_changeset(role, attrs) do
    role
    |> cast(attrs, [:name, :color, :permissions, :position, :hoist, :mentionable])
    |> validate_required([:name])
  end
end
