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
    %{
      id: server_member.id,
      roles: server_member.roles,
      joined_at: server_member.joined_at
    }
  end
end
