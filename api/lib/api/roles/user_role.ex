# lib/api/roles/user_role.ex
defmodule Api.Roles.UserRole do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  alias Api.Repo
  alias Api.Accounts.User
  alias Api.Roles.Role
  alias Api.Servers.Server

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "user_roles" do
    belongs_to(:user, Api.Accounts.User)
    belongs_to(:role, Api.Roles.Role)
    belongs_to(:server, Api.Servers.Server)

    timestamps(type: :utc_datetime)
  end

  def changeset(user_role, attrs) do
    user_role
    |> cast(attrs, [:user_id, :role_id, :server_id])
    |> validate_required([:user_id, :role_id, :server_id])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:role_id)
    |> foreign_key_constraint(:server_id)
    |> unique_constraint([:user_id, :role_id],
      message: "This role is already assigned to this user"
    )
    |> validate_role_server_match()
  end

  # Validates that the role belongs to the same server specified in server_id
  defp validate_role_server_match(changeset) do
    case {get_field(changeset, :role_id), get_field(changeset, :server_id)} do
      {nil, _} ->
        changeset

      {_, nil} ->
        changeset

      {role_id, server_id} ->
        # Get the server_id from the role
        role_query =
          from(r in Role,
            where: r.id == ^role_id,
            select: r.server_id
          )

        case Repo.one(role_query) do
          ^server_id ->
            # Role server_id matches the provided server_id
            changeset

          nil ->
            add_error(changeset, :role_id, "Role not found")

          different_server_id ->
            add_error(changeset, :role_id, "Role must belong to the specified server")
        end
    end
  end
end
