defmodule ApiWeb.ServerMemberJSON do
  alias Api.Servers.ServerMember

  @doc """
  Renders a list of server_members.
  """
  def index(%{server_members: server_members}) do
    %{data: for(server_member <- server_members, do: data(server_member))}
  end

  @doc """
  Renders a single server_member.
  """
  def show(%{server_member: server_member}) do
    %{data: data(server_member)}
  end

  defp data(%ServerMember{} = server_member) do
    roles = ServerMember.get_roles(server_member)

    %{
      id: server_member.id,
      user_id: server_member.user_id,
      server_id: server_member.server_id,
      nickname: server_member.nickname,
      joined_at: server_member.joined_at,
      roles: render_roles(roles)
    }
  end

  defp render_roles(roles) do
    Enum.map(roles, fn role ->
      %{
        id: role.id,
        name: role.name,
        color: role.color
      }
    end)
  end
end
