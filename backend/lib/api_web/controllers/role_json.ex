defmodule ApiWeb.RoleJSON do
  alias Api.Roles.Role

  @doc """
  Renders a list of roles.
  """
  def index(%{roles: roles}) do
    %{roles: for(role <- roles, do: data(role))}
  end

  @doc """
  Renders a single role.
  """
  def show(%{role: role}) do
    %{role: data(role)}
  end

  def data(%Role{} = role) do
    %{
      id: role.id,
      name: role.name,
      color: role.color,
      permissions: role.permissions,
      position: role.position,
      hoist: role.hoist,
      mentionable: role.mentionable,
      server_id: role.server_id
    }
  end
end
