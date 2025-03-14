defmodule ApiWeb.ServerController do
  use ApiWeb, :controller

  alias Api.Servers
  alias Api.Servers.Server

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    servers = Servers.list_servers()
    render(conn, :index, servers: servers)
  end

  def create(conn, %{"server" => server_params}) do
    with {:ok, %Server{} = server} <- Servers.create_server(server_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/servers/#{server}")
      |> render(:show, server: server)
    end
  end

  def show(conn, %{"id" => id}) do
    server = Servers.get_server!(id)
    render(conn, :show, server: server)
  end

  def update(conn, %{"id" => id, "server" => server_params}) do
    server = Servers.get_server!(id)

    with {:ok, %Server{} = server} <- Servers.update_server(server, server_params) do
      render(conn, :show, server: server)
    end
  end

  def delete(conn, %{"id" => id}) do
    server = Servers.get_server!(id)

    with {:ok, %Server{}} <- Servers.delete_server(server) do
      send_resp(conn, :no_content, "")
    end
  end
end
