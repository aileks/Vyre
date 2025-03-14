defmodule ApiWeb.UserRoleController do
  use ApiWeb, :controller

  alias Api.Roles
  alias Api.Roles.UserRole

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    user_roles = Roles.list_user_roles()
    render(conn, :index, user_roles: user_roles)
  end

  def create(conn, %{"user_role" => user_role_params}) do
    with {:ok, %UserRole{} = user_role} <- Roles.create_user_role(user_role_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/user_roles/#{user_role}")
      |> render(:show, user_role: user_role)
    end
  end

  def show(conn, %{"id" => id}) do
    user_role = Roles.get_user_role!(id)
    render(conn, :show, user_role: user_role)
  end

  def update(conn, %{"id" => id, "user_role" => user_role_params}) do
    user_role = Roles.get_user_role!(id)

    with {:ok, %UserRole{} = user_role} <- Roles.update_user_role(user_role, user_role_params) do
      render(conn, :show, user_role: user_role)
    end
  end

  def delete(conn, %{"id" => id}) do
    user_role = Roles.get_user_role!(id)

    with {:ok, %UserRole{}} <- Roles.delete_user_role(user_role) do
      send_resp(conn, :no_content, "")
    end
  end
end
