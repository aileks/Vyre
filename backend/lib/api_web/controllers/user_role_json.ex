defmodule ApiWeb.UserRoleJSON do
  alias Api.Roles.UserRole

  @doc """
  Renders a list of user_roles.
  """
  def index(%{user_roles: user_roles}) do
    %{data: for(user_role <- user_roles, do: data(user_role))}
  end

  @doc """
  Renders a single user_role.
  """
  def show(%{user_role: user_role}) do
    %{data: data(user_role)}
  end

  defp data(%UserRole{} = user_role) do
    %{
      id: user_role.id
    }
  end
end
