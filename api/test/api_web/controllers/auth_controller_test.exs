defmodule ApiWeb.AuthControllerTest do
  use ApiWeb.ConnCase, async: true

  alias Api.Accounts
  alias Api.Accounts.User

  @valid_attrs %{
    email: "user@example.com",
    password: "supersecretpassword",
    username: "testuser",
    display_name: "Test User"
  }

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "login" do
    setup [:create_user]

    test "returns token when credentials are valid", %{conn: conn, user: user} do
      conn =
        post(conn, ~p"/api/auth/login", %{
          "email" => user.email,
          "password" => @valid_attrs.password
        })

      assert %{
               "user" => returned_user,
               "token" => token
             } = json_response(conn, 200)

      assert returned_user["email"] == user.email
      assert returned_user["username"] == user.username
      assert returned_user["display_name"] == user.display_name
      assert is_binary(token) && String.length(token) > 0
    end

    test "returns error when email is invalid", %{conn: conn} do
      conn =
        post(conn, ~p"/api/auth/login", %{
          "email" => "wrong@example.com",
          "password" => @valid_attrs.password
        })

      assert json_response(conn, 401) == %{
               "errors" => %{"detail" => "Invalid credentials"}
             }
    end

    test "returns error when password is invalid", %{conn: conn, user: user} do
      conn =
        post(conn, ~p"/api/auth/login", %{
          "email" => user.email,
          "password" => "wrongpassword"
        })

      assert json_response(conn, 401) == %{
               "errors" => %{"detail" => "Invalid credentials"}
             }
    end
  end

  describe "register" do
    test "creates and returns user with token when data is valid", %{conn: conn} do
      conn =
        post(conn, ~p"/api/auth/register", %{
          "user" => @valid_attrs
        })

      assert %{
               "user" => user,
               "token" => token
             } = json_response(conn, 201)

      assert user["email"] == @valid_attrs.email
      assert user["username"] == @valid_attrs.username
      assert user["display_name"] == @valid_attrs.display_name
      assert is_binary(token) && String.length(token) > 0

      # Ensure the user was actually created in the database
      assert {:ok, db_user} = Accounts.get_user_by_email(@valid_attrs.email)
      assert db_user.email == @valid_attrs.email
    end

    test "returns errors when registration data is invalid", %{conn: conn} do
      conn =
        post(conn, ~p"/api/auth/register", %{
          "user" => %{
            email: "invalid-email",
            password: "short",
            username: nil
          }
        })

      assert response = json_response(conn, 422)
      assert "errors" in Map.keys(response)
      assert is_map(response["errors"])
      assert "email" in Map.keys(response["errors"])
      assert "password" in Map.keys(response["errors"])
      assert "username" in Map.keys(response["errors"])
    end

    test "returns error when email is already taken", %{conn: conn} do
      # First, create a user with the test email
      {:ok, _user} = Accounts.create_user(@valid_attrs)

      # Try to register another user with the same email
      conn =
        post(conn, ~p"/api/auth/register", %{
          "user" => @valid_attrs
        })

      assert response = json_response(conn, 422)
      assert "errors" in Map.keys(response)
      assert "email" in Map.keys(response["errors"])

      assert Enum.any?(response["errors"]["email"], fn err ->
               err =~ "has already been taken" || err =~ "already in use"
             end)
    end
  end

  describe "me (current user)" do
    setup [:create_user, :login_user]

    test "returns current user when token is valid", %{conn: conn, user: user, token: token} do
      conn =
        conn
        |> put_req_header("authorization", "Bearer #{token}")
        |> get(~p"/api/auth/me")

      assert %{"user" => returned_user} = json_response(conn, 200)
      assert returned_user["id"] == user.id
      assert returned_user["email"] == user.email
      assert returned_user["username"] == user.username
    end

    test "returns error when token is missing", %{conn: conn} do
      conn = get(conn, ~p"/api/auth/me")

      assert json_response(conn, 401) == %{
               "errors" => %{"detail" => "Unauthorized"}
             }
    end

    test "returns error when token is invalid", %{conn: conn} do
      conn =
        conn
        |> put_req_header("authorization", "Bearer invalidtoken")
        |> get(~p"/api/auth/me")

      assert json_response(conn, 401) == %{
               "errors" => %{"detail" => "Unauthorized"}
             }
    end
  end

  describe "refresh" do
    setup [:create_user, :login_user]

    test "returns new token when refresh token is valid", %{conn: conn, token: token} do
      conn =
        conn
        |> put_req_header("authorization", "Bearer #{token}")
        |> post(~p"/api/auth/refresh")

      assert %{"token" => new_token} = json_response(conn, 200)
      assert is_binary(new_token) && String.length(new_token) > 0
      assert new_token != token
    end

    test "returns error when refresh token is missing", %{conn: conn} do
      conn = post(conn, ~p"/api/auth/refresh")

      assert json_response(conn, 401) == %{
               "errors" => %{"detail" => "Unauthorized"}
             }
    end

    test "returns error when refresh token is invalid", %{conn: conn} do
      conn =
        conn
        |> put_req_header("authorization", "Bearer invalidtoken")
        |> post(~p"/api/auth/refresh")

      assert json_response(conn, 401) == %{
               "errors" => %{"detail" => "Unauthorized"}
             }
    end
  end

  defp create_user(_) do
    {:ok, user} = Accounts.create_user(@valid_attrs)
    %{user: user}
  end

  defp login_user(%{conn: conn, user: user}) do
    {:ok, token, _claims} = Api.Accounts.Guardian.encode_and_sign(user)
    %{token: token}
  end
end
