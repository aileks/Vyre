defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias Api.Accounts
  alias Api.Accounts.Guardian

  action_fallback(ApiWeb.FallbackController)

  def register(conn, %{"user" => user_params}) do
    with {:ok, user} <- Accounts.register_user(user_params) do
      token = Guardian.create_token(user)

      conn
      |> put_status(:created)
      |> render(:user_with_token, %{user: user, token: token})
    end
  end

  def login(conn, %{"user" => %{"email" => email, "password" => password}}) do
    with {:ok, user} <- Accounts.authenticate_user(email, password) do
      token = Guardian.create_token(user)

      conn
      |> put_status(:ok)
      |> render(:user_with_token, %{user: user, token: token})
    end
  end

  def me(conn, _params) do
    case conn.assigns[:current_user] do
      {:ok, user} -> render(conn, :user, %{user: user})
      %Api.Accounts.User{} = user -> render(conn, :user, %{user: user})
      _ -> send_resp(conn, 401, "Unauthorized")
    end
  end
end
