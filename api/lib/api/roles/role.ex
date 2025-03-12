defmodule Api.Roles.Role do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "roles" do
    field(:name, :string)
    field(:position, :integer)
    field(:permissions, :integer)
    field(:color, :string)
    field(:hoist, :boolean, default: false)
    field(:mentionable, :boolean, default: false)
    field(:server_id, :binary_id)
    timestamps(type: :utc_datetime)

    belongs_to(:server, Api.Servers.Server, foreign_key: :server_id)
  end

  @doc false
  def changeset(role, attrs) do
    role
    |> cast(attrs, [:name, :color, :permissions, :position, :hoist, :mentionable])
    |> validate_required([:name, :color, :permissions, :position, :hoist, :mentionable])
  end
end
