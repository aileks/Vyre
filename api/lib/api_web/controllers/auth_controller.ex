defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias Api.Accounts
  alias Api.Accounts.User

  action_fallback(ApiWeb.FallbackController)

  def register(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Accounts.register_user(user_params),
         {:ok, token, _claims} <- Accounts.create_token(user) do
      conn
      |> put_status(:created)
      |> render(:user, %{user: user, token: token})
    end
  end

  def login(conn, %{"user" => %{"email_or_username" => email_or_username, "password" => password}}) do
    with {:ok, user} <- Accounts.authenticate_user(email_or_username, password),
         {:ok, token, _claims} <- Accounts.create_token(user) do
      conn
      |> put_status(:ok)
      |> render(:user, %{user: user, token: token})
    end
  end

  def me(conn, _params) do
    user = conn.assigns.current_user
    render(conn, :user, %{user: user})
  end
end
