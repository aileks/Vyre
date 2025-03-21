defmodule Api.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Api.Repo

  alias Api.Accounts.User

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    users = Repo.all(User)

    users_with_basic =
      Repo.preload(users, [
        :owned_servers,
        :messages,
        :servers,
        :sent_private_messages,
        :received_private_messages,
        :friendships,
        :friend_requests
      ])

    Enum.map(users_with_basic, &preload_memberships_with_roles/1)
  end

  @doc """
  Gets a single user.

  Returns `nil` if the User does not exist.

  ## Examples

      iex> get_user(123)
      %User{}

      iex> get_user(456)
      nil

  """
  def get_user(id) do
    case Repo.get(User, id) do
      nil ->
        nil

      user ->
        user
        |> preload_basic_user_associations()
        |> preload_memberships_with_roles()
    end
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
    |> Repo.preload([
      :owned_servers,
      :messages,
      :servers,
      :sent_private_messages,
      :received_private_messages,
      :friendships,
      :friend_requests
    ])
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{data: %User{}}

  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end

  @doc """
  Registers a user.
  """
  def register_user(attrs \\ %{}) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Gets a single user.any() by email.

  Returns 'nil' if the user doesn't exist.

  ## Examples

      iex> get_user_by_email("user@example.com")
      %User{}

      iex> get_user_by_email("unknown@example.com")
      nil

  """
  def get_user_by_email(email) when is_binary(email) do
    case Repo.get_by(User, email: email) do
      nil ->
        nil

      user ->
        user
        |> preload_basic_user_associations()
        |> preload_memberships_with_roles()
    end
  end

  @doc """
  Gets a single user.any() by username.

  Returns 'nil' if the user doesn't exist.

  ## Examples

      iex> get_user_by_username("username123")
      %User{}

      iex> get_user_by_username("unknown")
      nil

  """
  def get_user_by_username(username) when is_binary(username) do
    case Repo.get_by(User, username: username) do
      nil ->
        nil

      user ->
        user
        |> preload_basic_user_associations()
        |> preload_memberships_with_roles()
    end
  end

  @doc """
  Verifies a user's password if they exist.
  Includes a failsafe for invalid credentials to prevent timing attacks.
  """
  def validate_password(password, password_hash) do
    Bcrypt.verify_pass(password, password_hash)
  end

  defp preload_basic_user_associations(user_or_users) do
    Repo.preload(user_or_users, [
      :owned_servers,
      :messages,
      :servers,
      :sent_private_messages,
      :received_private_messages,
      :friendships,
      :friend_requests
    ])
  end

  # FIXME: Why did I make this so complex?
  defp preload_memberships_with_roles(user) do
    user_with_memberships = Repo.preload(user, :server_memberships)

    # Early return if no memberships
    if Enum.empty?(user_with_memberships.server_memberships) do
      user_with_memberships
    else
      # Extract all server IDs for bulk role loading
      server_ids = Enum.map(user_with_memberships.server_memberships, & &1.server_id)

      role_assignments =
        Repo.all(
          from(ur in Api.Roles.UserRole,
            where: ur.user_id == ^user.id and ur.server_id in ^server_ids,
            select: {ur.server_id, ur.role_id}
          )
        )

      # Group role IDs by server ID
      role_ids_by_server = Enum.group_by(role_assignments, &elem(&1, 0), &elem(&1, 1))

      # Avoid N+1
      all_role_ids = Enum.flat_map(role_assignments, fn {_, role_id} -> [role_id] end)

      roles_by_id =
        if Enum.empty?(all_role_ids) do
          %{}
        else
          Repo.all(
            from(r in Api.Roles.Role,
              where: r.id in ^all_role_ids,
              order_by: [desc: r.position]
            )
          )
          |> Enum.group_by(& &1.id)
        end

      # Attach roles to each membership
      updated_memberships =
        Enum.map(user_with_memberships.server_memberships, fn membership ->
          roles =
            role_ids_by_server
            |> Map.get(membership.server_id, [])
            |> Enum.flat_map(fn role_id ->
              Map.get(roles_by_id, role_id, [])
            end)
            |> Enum.sort_by(& &1.position, :desc)

          %{membership | roles: roles}
        end)

      %{user_with_memberships | server_memberships: updated_memberships}
    end
  end
end
