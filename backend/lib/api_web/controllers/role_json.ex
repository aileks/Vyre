defmodule ApiWeb.RoleJSON do
  alias Api.Roles.Role

  @doc """
  Renders a list of roles.
  """
  def index(%{roles: roles}) do
    %{data: for(role <- roles, do: data(role))}
  end

  @doc """
  Renders a single role.
  """
  def show(%{role: role}) do
    %{data: data(role)}
  end

  defp data(%Role{} = role) do
    %{
      id: role.id,
      name: role.name,
      color: role.color,
      permissions: role.permissions,
      position: role.position,
      hoist: role.hoist,
      mentionable: role.mentionable
    }
  end
end
