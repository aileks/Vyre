defmodule Api.Servers do
  @moduledoc """
  The Servers context.
  """
  import Ecto.Query, warn: false

  alias Api.Repo
  alias Api.Servers.Server
  alias Api.Servers.ServerMember
  alias Api.Roles.Role
  alias Api.Roles.UserRole

  @doc """
  Returns the list of servers.

  ## Examples

      iex> list_servers()
      [%Server{}, ...]

  """
  def list_servers do
    Repo.all(Server)
  end

  @doc """
  Gets a single server.

  Raises `Ecto.NoResultsError` if the Server does not exist.

  ## Examples

      iex> get_server!(123)
      %Server{}

      iex> get_server!(456)
      ** (Ecto.NoResultsError)

  """
  def get_server!(id), do: Repo.get!(Server, id)

  def get_server(id) do
    Repo.get(Server, id)
  end

  @doc """
  Creates a server.

  ## Examples

      iex> create_server(%{field: value})
      {:ok, %Server{}}

      iex> create_server(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_server(attrs, owner) do
    Repo.transaction(fn ->
      server_changeset =
        %Server{}
        |> Server.changeset(Map.put(attrs, "owner_id", owner.id))

      with {:ok, server} <- Repo.insert(server_changeset) do
        # Create default roles
        owner_role =
          %Role{
            name: "Owner",
            server_id: server.id,
            color: "#FF0000",
            permissions: 8,
            position: 100,
            hoist: true,
            mentionable: true
          }
          |> Repo.insert!()

        %Role{
          name: "Admin",
          server_id: server.id,
          color: "#FF0000",
          permissions: 8,
          position: 100,
          hoist: true,
          mentionable: true
        }
        |> Repo.insert!()

        %Role{
          name: "Moderator",
          server_id: server.id,
          color: "#00FF00",
          permissions: 4,
          position: 50,
          hoist: true,
          mentionable: true
        }
        |> Repo.insert!()

        %Role{
          name: "Member",
          server_id: server.id,
          color: "#FFFFFF",
          permissions: 1,
          position: 1,
          hoist: false,
          mentionable: false
        }
        |> Repo.insert!()

        membership_attrs = %{
          user_id: owner.id,
          server_id: server.id,
          nickname: owner.display_name
        }

        %ServerMember{}
        |> ServerMember.changeset(membership_attrs)
        |> Repo.insert!()

        %UserRole{
          user_id: owner.id,
          role_id: owner_role.id,
          server_id: server.id
        }
        |> Repo.insert!()

        server
      end
    end)
  end

  @doc """
  Updates a server.

  ## Examples

      iex> update_server(server, %{field: new_value})
      {:ok, %Server{}}

      iex> update_server(server, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_server(%Server{} = server, attrs) do
    server
    |> Server.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a server.

  ## Examples

      iex> delete_server(server)
      {:ok, %Server{}}

      iex> delete_server(server)
      {:error, %Ecto.Changeset{}}

  """
  def delete_server(%Server{} = server) do
    Repo.delete(server)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking server changes.

  ## Examples

      iex> change_server(server)
      %Ecto.Changeset{data: %Server{}}

  """
  def change_server(%Server{} = server, attrs \\ %{}) do
    Server.changeset(server, attrs)
  end

  alias Api.Servers.ServerMember

  @doc """
  Returns the list of server_members.

  ## Examples

      iex> list_server_members()
      [%ServerMember{}, ...]

  """
  def list_server_members do
    Repo.all(ServerMember)
  end

  @doc """
  Gets a single server_member.

  Raises `Ecto.NoResultsError` if the Server member does not exist.

  ## Examples

      iex> get_server_member!(123)
      %ServerMember{}

      iex> get_server_member!(456)
      ** (Ecto.NoResultsError)

  """
  def get_server_member!(id), do: Repo.get!(ServerMember, id)

  def get_server_member(server_id, user_id) do
    case Repo.get_by(ServerMember, server_id: server_id, user_id: user_id) do
      nil -> nil
      member -> load_member_with_roles(member)
    end
  end

  @doc """
  Creates a server_member.

  ## Examples

      iex> create_server_member(%{field: value})
      {:ok, %ServerMember{}}

      iex> create_server_member(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_server_member(attrs \\ %{}) do
    %ServerMember{}
    |> ServerMember.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a server_member.

  ## Examples

      iex> update_server_member(server_member, %{field: new_value})
      {:ok, %ServerMember{}}

      iex> update_server_member(server_member, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_server_member(%ServerMember{} = server_member, attrs) do
    server_member
    |> ServerMember.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a server_member.

  ## Examples

      iex> delete_server_member(server_member)
      {:ok, %ServerMember{}}

      iex> delete_server_member(server_member)
      {:error, %Ecto.Changeset{}}

  """
  def delete_server_member(%ServerMember{} = server_member) do
    Repo.delete(server_member)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking server_member changes.

  ## Examples

      iex> change_server_member(server_member)
      %Ecto.Changeset{data: %ServerMember{}}

  """
  def change_server_member(%ServerMember{} = server_member, attrs \\ %{}) do
    ServerMember.changeset(server_member, attrs)
  end

  def load_member_with_roles(%ServerMember{} = member) do
    roles = Api.Roles.get_user_roles(member.user_id, member.server_id)
    %{member | roles: roles}
  end

  def load_members_with_roles(members) when is_list(members) do
    Enum.map(members, &load_member_with_roles/1)
  end

  def list_server_members(server_id) do
    members = Repo.all(from(m in ServerMember, where: m.server_id == ^server_id))
    load_members_with_roles(members)
  end

  def add_role_to_member(server_id, user_id, role_id) do
    # Verify the user is a member of this server
    with %ServerMember{} = _member <- get_server_member_without_roles(server_id, user_id),
         %Role{} = role <- Roles.get_role!(role_id),
         true <- role.server_id == server_id do
      Api.Roles.assign_role(%{user_id: user_id, role_id: role_id, server_id: server_id})
    else
      nil -> {:error, :not_found}
      false -> {:error, :invalid_role}
      error -> error
    end
  end

  # TODO
  # def remove_role_from_member(server_id, user_id, role_id) do
  #   with %ServerMember{} = _member <- get_server_member_without_roles(server_id, user_id),
  #        %Role{} = role <- Api.Roles.get_role!(role_id),
  #        true <- role.server_id == server_id,
  #        {count, _} when count > 0 <- Api.Roles.remove_role(user_id, role_id) do
  #     {:ok, nil}
  #   else
  #     nil -> {:error, :not_found}
  #     false -> {:error, :invalid_role}
  #     {0, _} -> {:error, :role_not_assigned}
  #     error -> error
  #   end
  # end

  defp get_server_member_without_roles(server_id, user_id) do
    Repo.get_by(ServerMember, server_id: server_id, user_id: user_id)
  end
end
