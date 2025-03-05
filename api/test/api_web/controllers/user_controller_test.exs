defmodule ApiWeb.UserControllerTest do
  use ApiWeb.ConnCase

  import Api.AccountsFixtures

  alias Api.Accounts.User

  @invalid_attrs %{
    status: nil,
    username: nil,
    display_name: nil,
    email: nil,
    password: nil,
    avatar_url: nil
  }

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all users", %{conn: conn} do
      conn = get(conn, ~p"/api/users")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create user" do
    test "renders user when data is valid", %{conn: conn} do
      email = unique_user_email()
      username = unique_user_username()
      avatar_url = "https://example.com/avatar.jpg"
      display_name = "Test User"
      status = "active"

      attrs = %{
        status: status,
        username: username,
        display_name: display_name,
        email: email,
        password: "Password123",
        avatar_url: avatar_url
      }

      conn = post(conn, ~p"/api/users", user: attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/users/#{id}")

      assert %{
               "id" => ^id,
               "avatar_url" => ^avatar_url,
               "display_name" => ^display_name,
               "email" => ^email,
               "status" => ^status,
               "username" => ^username
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/users", user: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update user" do
    setup [:create_user]

    test "renders user when data is valid", %{conn: conn, user: %User{id: id} = user} do
      email = unique_user_email()
      username = unique_user_username()
      avatar_url = "https://example.com/updated.jpg"
      display_name = "Updated User"
      status = "inactive"

      update_attrs = %{
        status: status,
        username: username,
        display_name: display_name,
        email: email,
        password: "UpdatedPass123",
        avatar_url: avatar_url
      }

      conn = put(conn, ~p"/api/users/#{user}", user: update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/users/#{id}")

      assert %{
               "id" => ^id,
               "avatar_url" => ^avatar_url,
               "display_name" => ^display_name,
               "email" => ^email,
               "status" => ^status,
               "username" => ^username
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, user: user} do
      conn = put(conn, ~p"/api/users/#{user}", user: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete user" do
    setup [:create_user]

    test "deletes chosen user", %{conn: conn, user: user} do
      conn = delete(conn, ~p"/api/users/#{user}")
      assert response(conn, 204)

      # Checking for 404 res directly - kinda hacky
      conn = get(conn, ~p"/api/users/#{user}")
      assert json_response(conn, 404)["errors"] != nil
    end
  end

  defp create_user(_) do
    user = user_fixture()
    %{user: user}
  end
end
