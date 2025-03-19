defmodule Api.Servers.ServerMember do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  alias Api.Roles.Role
  alias Api.Roles.UserRole

  @derive {Jason.Encoder, only: [:id, :user_id, :server_id, :nickname, :joined_at, :roles]}

  @schema_prefix System.get_env("DB_SCHEMA")
  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "server_members" do
    field(:joined_at, :utc_datetime, default: DateTime.utc_now() |> DateTime.truncate(:second))
    field(:nickname, :string)
    field(:roles, {:array, :map}, virtual: true, default: [])
    timestamps(type: :utc_datetime)

    belongs_to(:user, Api.Accounts.User, foreign_key: :user_id)
    belongs_to(:server, Api.Servers.Server, foreign_key: :server_id)
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

  def get_roles(%__MODULE__{} = server_member) do
    from(ur in UserRole,
      join: r in Role,
      on: ur.role_id == r.id,
      where: ur.user_id == ^server_member.user_id and r.server_id == ^server_member.server_id,
      select: r
    )
    |> Api.Repo.all()
  end
end
