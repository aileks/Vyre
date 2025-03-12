defmodule ApiWeb.UserRoleControllerTest do
  use ApiWeb.ConnCase

  import Api.RolesFixtures

  alias Api.Roles.UserRole

  @create_attrs %{

  }
  @update_attrs %{

  }
  @invalid_attrs %{}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all user_roles", %{conn: conn} do
      conn = get(conn, ~p"/api/user_roles")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create user_role" do
    test "renders user_role when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/user_roles", user_role: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/user_roles/#{id}")

      assert %{
               "id" => ^id
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/user_roles", user_role: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update user_role" do
    setup [:create_user_role]

    test "renders user_role when data is valid", %{conn: conn, user_role: %UserRole{id: id} = user_role} do
      conn = put(conn, ~p"/api/user_roles/#{user_role}", user_role: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/user_roles/#{id}")

      assert %{
               "id" => ^id
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, user_role: user_role} do
      conn = put(conn, ~p"/api/user_roles/#{user_role}", user_role: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete user_role" do
    setup [:create_user_role]

    test "deletes chosen user_role", %{conn: conn, user_role: user_role} do
      conn = delete(conn, ~p"/api/user_roles/#{user_role}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/user_roles/#{user_role}")
      end
    end
  end

  defp create_user_role(_) do
    user_role = user_role_fixture()
    %{user_role: user_role}
  end
end
