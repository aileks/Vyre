defmodule Api.Servers.ServerMember do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "server_members" do
    field(:joined_at, :utc_datetime, default: DateTime.utc_now() |> DateTime.truncate(:second))
    field(:nickname, :string)
    timestamps(type: :utc_datetime)

    belongs_to(:user, Api.Accounts.User, foreign_key: :user_id)
    belongs_to(:server, Api.Servers.Server, foreign_key: :server_id)
    many_to_many(:roles, Api.Roles.Role, join_through: "server_member_roles")
  end

  def changeset(server_member, attrs) do
    server_member
    |> cast(attrs, [:user_id, :server_id, :nickname])
    |> validate_required([:user_id, :server_id])
    |> validate_length(:nickname, max: 32)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:server_id)
    |> unique_constraint([:user_id, :server_id],
      name: "server_members_user_id_server_id_index",
      message: "User is already a member of this server"
    )
  end

  def update_changeset(server_member, attrs) do
    server_member
    |> cast(attrs, [:nickname])
    |> validate_length(:nickname, max: 32)
  end

  def roles_changeset(server_member, roles) do
    server_member
    |> cast(%{}, [])
    |> put_assoc(:roles, roles)
  end
end
