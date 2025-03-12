defmodule Api.Roles.UserRole do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "user_roles" do
    field(:user_id, :binary_id, null: false)
    field(:role_id, :binary_id, null: false)
    field(:server_id, :binary_id, null: false)

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user_role, attrs) do
    user_role
    |> cast(attrs, [:user_id, :role_id, :server_id])
    |> validate_required([:user_id, :role_id, :server_id])
  end
end
