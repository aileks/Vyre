defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias ApiWeb.Auth.Guardian, as: AuthGuardian

  action_fallback(ApiWeb.FallbackController)

  def login(conn, %{"user" => %{"email" => email, "password" => password} = params}) do
    remember_me = Map.get(params, "remember_me", false)

    case AuthGuardian.authenticate(email, password, remember_me) do
      {:ok, user, token} ->
        conn
        |> AuthGuardian.Plug.sign_in(user)
        |> put_status(:ok)
        |> put_view(ApiWeb.UserJSON)
        |> render(:show_with_token, %{user: user, token: token})

      {:error, _reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid credentials"})
    end
  end

  def refresh_session(conn, _params) do
    token = Guardian.Plug.current_token(conn)

    if is_nil(token) do
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Invalid token"})
    else
      case AuthGuardian.authenticate(token) do
        {:ok, user, new_token} ->
          conn
          |> AuthGuardian.Plug.sign_in(user, %{}, AuthGuardian.token_opts(:access))
          |> put_status(:ok)
          |> put_view(ApiWeb.UserJSON)
          |> render(:show_with_token, %{user: user, token: new_token})

        {:error, _reason} ->
          conn
          |> put_status(:internal_server_error)
          |> json(%{error: "Server error"})
      end
    end
  end

  def logout(conn, %{"refresh_token" => refresh_token}) do
    access_token = Guardian.Plug.current_token(conn)
    if access_token, do: AuthGuardian.revoke(access_token)

    if refresh_token, do: AuthGuardian.revoke(refresh_token)

    conn
    |> AuthGuardian.Plug.sign_out()
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
