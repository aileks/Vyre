defmodule ApiWeb.ServerMemberController do
  use ApiWeb, :controller

  alias Api.Servers
  alias Api.Servers.ServerMember

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    server_members = Servers.list_server_members()
    render(conn, :index, server_members: server_members)
  end

  def create(conn, %{"server_member" => server_member_params}) do
    with {:ok, %ServerMember{} = server_member} <- Servers.create_server_member(server_member_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/server_members/#{server_member}")
      |> render(:show, server_member: server_member)
    end
  end

  def show(conn, %{"id" => id}) do
    server_member = Servers.get_server_member!(id)
    render(conn, :show, server_member: server_member)
  end

  def update(conn, %{"id" => id, "server_member" => server_member_params}) do
    server_member = Servers.get_server_member!(id)

    with {:ok, %ServerMember{} = server_member} <- Servers.update_server_member(server_member, server_member_params) do
      render(conn, :show, server_member: server_member)
    end
  end

  def delete(conn, %{"id" => id}) do
    server_member = Servers.get_server_member!(id)

    with {:ok, %ServerMember{}} <- Servers.delete_server_member(server_member) do
      send_resp(conn, :no_content, "")
    end
  end
end
