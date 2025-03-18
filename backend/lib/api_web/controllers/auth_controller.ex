defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias ApiWeb.Auth.Guardian

  action_fallback(ApiWeb.FallbackController)

  def login(conn, %{"email" => email, "password" => password}) do
    case Guardian.authenticate(email, password) do
      {:ok, user, token} ->
        conn
        |> Guardian.Plug.sign_in(user)
        |> put_status(:ok)
        |> put_view(ApiWeb.UserJSON)
        |> render(:show_with_token, %{user: user, token: token})

      {:error, _reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid credentials"})
    end
  end

  def logout(conn, _params) do
    conn
    |> Guardian.Plug.sign_out()
    |> clear_session()
    |> put_status(:ok)
    |> json(%{message: "Logged out successfully"})
  end

  def me(conn, _params) do
    case Guardian.Plug.current_resource(conn) do
      nil ->
        conn
        |> put_status(:unauthorized)
        |> render("401.json", %{error: "Unauthorized"})

      user ->
        conn
        |> put_status(:ok)
        |> put_view(ApiWeb.AuthJSON)
        |> render(:me, %{user: user})
    end
  end
end
