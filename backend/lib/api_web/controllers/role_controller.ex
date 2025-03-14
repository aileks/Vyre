defmodule ApiWeb.RoleController do
  use ApiWeb, :controller

  alias Api.Roles
  alias Api.Roles.Role

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    roles = Roles.list_roles()
    render(conn, :index, roles: roles)
  end

  def create(conn, %{"role" => role_params}) do
    with {:ok, %Role{} = role} <- Roles.create_role(role_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/roles/#{role}")
      |> render(:show, role: role)
    end
  end

  def show(conn, %{"id" => id}) do
    role = Roles.get_role!(id)
    render(conn, :show, role: role)
  end

  def update(conn, %{"id" => id, "role" => role_params}) do
    role = Roles.get_role!(id)

    with {:ok, %Role{} = role} <- Roles.update_role(role, role_params) do
      render(conn, :show, role: role)
    end
  end

  def delete(conn, %{"id" => id}) do
    role = Roles.get_role!(id)

    with {:ok, %Role{}} <- Roles.delete_role(role) do
      send_resp(conn, :no_content, "")
    end
  end
end
