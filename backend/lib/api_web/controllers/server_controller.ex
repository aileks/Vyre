defmodule ApiWeb.ServerController do
  use ApiWeb, :controller

  alias Api.Servers
  alias Api.Servers.Server

  action_fallback(ApiWeb.FallbackController)

  def index(conn, _params) do
    servers = Servers.list_servers()
    render(conn, :index, servers: servers)
  end

  def create(conn, %{"server" => server_params}) do
    owner = conn.private[:guardian_default_resource]

    with {:ok, %Server{} = server} <- Servers.create_server(server_params, owner) do
      conn
      |> put_status(:created)
      |> render(:show, server: server)
    end
  end

  def show(conn, %{"id" => id}) do
    case Servers.get_server(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> put_view(ApiWeb.ErrorJSON)
        |> render("404.json")

      server ->
        render(conn, :show, server: server)
    end
  end

  def update(conn, %{"id" => id} = server_params) do
    server = Servers.get_server!(id)
    user = conn.private[:guardian_default_resource]

    # TODO: Gate this behind permissions instead of owner in the future
    case user.id == server.owner_id do
      true ->
        with {:ok, %Server{} = server} <- Servers.update_server(server, server_params) do
          render(conn, :show, server: server)
        end

      false ->
        conn
        |> put_status(:forbidden)
        |> put_view(ApiWeb.ErrorJSON)
        |> render("403.json", %{error: "You do not have access to this resource."})
    end
  end

  def delete(conn, %{"id" => id}) do
    case Servers.get_server(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> put_view(ApiWeb.ErrorJSON)
        |> render("404.json", %{message: "Server not found"})

      server ->
        # Server exists, try to delete it
        case Servers.delete_server(server) do
          {:ok, _} ->
            json(conn, %{message: "Server deleted successfully"})

          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> put_view(ApiWeb.ErrorJSON)
            |> render("error.json", %{message: "Failed to delete server: #{inspect(reason)}"})
        end
    end
  end
end
