defmodule ApiWeb.AuthControllerTest do
  use ApiWeb.ConnCase

  @valid_attrs %{
    email: "user@example.com",
    username: "testuser",
    password: "password123",
    display_name: "Test User"
  }

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "registration" do
    test "registers a user when data is valid", %{conn: conn} do
      conn = post(conn, Routes.auth_path(conn, :register), user: @valid_attrs)
      assert %{"data" => data, "token" => token} = json_response(conn, 201)
      assert data["email"] == "user@example.com"
      assert data["username"] == "testuser"
      assert token != nil
    end

    test "returns errors when data is invalid", %{conn: conn} do
      conn =
        post(conn, Routes.auth_path(conn, :register), user: %{email: "invalid", password: "p"})

      assert %{"errors" => errors} = json_response(conn, 422)
      # Error about invalid email format
      assert errors["email"] != nil
      # Error about password too short
      assert errors["password"] != nil
    end
  end

  describe "login" do
    setup do
      {:ok, _user} = Api.Accounts.register_user(@valid_attrs)
      :ok
    end

    test "authenticates user with valid credentials", %{conn: conn} do
      login_attrs = %{email_or_username: "user@example.com", password: "password123"}
      conn = post(conn, Routes.auth_path(conn, :login), user: login_attrs)
      assert %{"data" => data, "token" => token} = json_response(conn, 200)
      assert data["email"] == "user@example.com"
      assert token != nil
    end

    test "allows login with username", %{conn: conn} do
      login_attrs = %{email_or_username: "testuser", password: "password123"}
      conn = post(conn, Routes.auth_path(conn, :login), user: login_attrs)
      assert %{"token" => _token} = json_response(conn, 200)
    end

    test "returns error with invalid credentials", %{conn: conn} do
      login_attrs = %{email_or_username: "user@example.com", password: "wrongpassword"}
      conn = post(conn, Routes.auth_path(conn, :login), user: login_attrs)
      assert json_response(conn, 401)
    end
  end

  describe "me" do
    setup %{conn: conn} do
      {:ok, user} = Api.Accounts.register_user(@valid_attrs)
      {:ok, token, _claims} = Api.Accounts.create_token(user)

      conn =
        conn
        |> put_req_header("authorization", "Bearer #{token}")

      {:ok, conn: conn, user: user}
    end

    test "returns current user information", %{conn: conn, user: user} do
      conn = get(conn, Routes.auth_path(conn, :me))
      assert %{"data" => data} = json_response(conn, 200)
      assert data["id"] == user.id
      assert data["email"] == user.email
    end
  end
end
