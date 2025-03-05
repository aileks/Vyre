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
      res = json_response(conn, 201)

      assert res["user"]["email"] == email
      assert res["user"]["username"] == username
      assert res["user"]["display_name"] == "Test User"
      assert Map.has_key?(res, "token")
      assert is_binary(res["token"])
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

      assert res = json_response(conn, 422)
      assert res["errors"]["email"]
      assert res["errors"]["username"]
      # Password too short
      assert res["errors"]["password"]
    end

    test "returns error when email is already taken", %{conn: conn} do
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

      assert res = json_response(conn, 422)
      assert get_in(res, ["errors", "email"]) == ["Email already taken"]
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

      res = json_response(conn, 200)
      assert res["user"]["id"] == user.id
      assert res["user"]["email"] == user.email
      assert is_binary(res["token"])

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

      res = json_response(conn, 200)
      assert res["user"]["id"] == user.id
      assert is_binary(res["token"])
    end

    test "returns error when email/username is invalid", %{conn: conn} do
      conn =
        post(conn, ~p"/api/login",
          user: %{
            email_or_username: "nonexistent@example.com",
            password: "Password123"
          }
        )

      assert json_response(conn, 401)["errors"]["message"] =~ "Invalid"
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

      assert json_response(conn, 401)["errors"]["message"] =~ "Invalid"
    end
  end

  describe "me" do
    setup [:create_user_with_token]

    test "returns current user when token is valid", %{conn: conn, user: user} do
      conn = get(conn, ~p"/api/me")
      res = json_response(conn, 200)

      assert res["user"]["id"] == user.id
      assert res["user"]["email"] == user.email
      assert res["user"]["username"] == user.username
    end

    test "returns 401 when token is missing", %{conn: _conn} do
      # Create a new conn without the auth header
      conn = build_conn()
      conn = get(conn, ~p"/api/me")

      assert json_response(conn, 401)["errors"]["message"] == "Unauthorized"
    end

    test "returns 401 when token is invalid", %{conn: _conn} do
      # Use a conn with an invalid token
      conn =
        build_conn()
        |> put_req_header("authorization", "Bearer invalid_token")

      conn = get(conn, ~p"/api/me")

      assert json_response(conn, 401)["errors"]["message"] =~ "Unauthorized"
    end
  end

  # Helper function to create a user with a token for testing
  defp create_user_with_token(%{conn: conn}) do
    user = user_fixture()
    {:ok, token, _claims} = Api.Auth.Guardian.encode_and_sign(user, %{}, ttl: {1, :hour})
    conn = conn |> put_req_header("authorization", "Bearer #{token}")
    {:ok, %{conn: conn, user: user, token: token}}
  end
end
