defmodule ApiWeb.AuthControllerTest do
  use ApiWeb.ConnCase

  import Api.AccountsFixtures

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "register" do
    test "creates and returns user with token when data is valid", %{conn: conn} do
      email = unique_user_email()
      username = unique_user_username()

      attrs = %{
        email: email,
        username: username,
        password: "Password123",
        display_name: "Test User",
        avatar_url: "https://example.com/avatar.jpg"
      }

      conn = post(conn, ~p"/api/register", user: attrs)
      response = json_response(conn, 201)

      assert response["user"]["email"] == email
      assert response["user"]["username"] == username
      assert response["user"]["display_name"] == "Test User"
      assert Map.has_key?(response, "token")
      assert is_binary(response["token"])
    end

    test "returns errors when registration data is invalid", %{conn: conn} do
      # Missing required fields
      conn =
        post(conn, ~p"/api/register",
          user: %{
            email: "",
            username: "",
            password: "short"
          }
        )

      assert response = json_response(conn, 422)
      assert response["errors"]["email"]
      assert response["errors"]["username"]
      # Password too short
      assert response["errors"]["password"]
    end

    test "returns error when email is already taken", %{conn: conn} do
      # First create a user
      user = user_fixture()

      # Try to create another user with the same email
      conn =
        post(conn, ~p"/api/register",
          user: %{
            email: user.email,
            username: unique_user_username(),
            password: "Password123!",
            display_name: "Another Test User"
          }
        )

      assert response = json_response(conn, 422)
      assert get_in(response, ["errors", "email"]) == ["Email already taken"]
    end
  end

  describe "login" do
    test "returns token when credentials are valid", %{conn: conn} do
      password = "Password123"
      user = user_fixture(%{password: password})

      # Test login with email
      conn =
        post(conn, ~p"/api/login",
          user: %{
            email_or_username: user.email,
            password: password
          }
        )

      response = json_response(conn, 200)
      assert response["user"]["id"] == user.id
      assert response["user"]["email"] == user.email
      assert is_binary(response["token"])

      # Test login with username
      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> post(~p"/api/login",
          user: %{
            email_or_username: user.username,
            password: password
          }
        )

      response = json_response(conn, 200)
      assert response["user"]["id"] == user.id
      assert is_binary(response["token"])
    end

    test "returns error when email/username is invalid", %{conn: conn} do
      conn =
        post(conn, ~p"/api/login",
          user: %{
            email_or_username: "nonexistent@example.com",
            password: "Password123"
          }
        )

      assert json_response(conn, 401)["error"] =~ "Invalid"
    end

    test "returns error when password is invalid", %{conn: conn} do
      user = user_fixture()

      conn =
        post(conn, ~p"/api/login",
          user: %{
            email_or_username: user.email,
            password: "WrongPassword123"
          }
        )

      assert json_response(conn, 401)["error"] =~ "Invalid"
    end
  end

  describe "me (current user)" do
    setup [:create_user_with_token]

    test "returns current user when token is valid", %{conn: conn, user: user, token: token} do
      conn =
        conn
        |> put_req_header("authorization", "Bearer #{token}")
        |> get(~p"/api/me")

      response = json_response(conn, 200)
      assert response["user"]["id"] == user.id
      assert response["user"]["email"] == user.email
      assert response["user"]["username"] == user.username
    end

    test "returns 401 when token is missing", %{conn: conn} do
      conn = get(conn, ~p"/api/me")

      assert json_response(conn, 401)
    end

    test "returns 401 when token is invalid", %{conn: conn} do
      conn =
        conn
        |> put_req_header("authorization", "Bearer invalid_token")
        |> get(~p"/api/me")

      assert json_response(conn, 401)
    end
  end

  # Helper function to create a user with a token for testing
  defp create_user_with_token(%{conn: conn}) do
    user = user_fixture()

    token =
      try do
        {:ok, token, _claims} = Api.Auth.Guardian.create_token(user)
        token
      rescue
        # Fallback for tests
        _ -> "test-token"
      end

    {:ok, %{conn: conn, user: user, token: token}}
  end
end
