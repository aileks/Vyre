defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias Api.Accounts
  alias Api.Auth.Guardian

  action_fallback(ApiWeb.FallbackController)

  def register(conn, %{"user" => user_params}) do
    with {:ok, user} <- Accounts.register_user(user_params) do
      token = Guardian.create_token(user)

      conn
      |> put_status(:created)
      |> render(:user_with_token, %{user: user, token: token})
    end
  end

  def login(conn, %{"user" => %{"email_or_username" => email_or_username, "password" => password}}) do
    with {:ok, user} <- Accounts.authenticate_user(email_or_username, password) do
      token = Guardian.create_token(user)

      conn
      |> put_status(:ok)
      |> render(:user_with_token, %{user: user, token: token})
    end
  end

  def me(conn, _params) do
    user = conn.assigns.current_user
    render(conn, :user, %{user: user})
  end
end
