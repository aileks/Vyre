defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias ApiWeb.Auth.Guardian, as: AuthGuardian

  action_fallback(ApiWeb.FallbackController)

  def login(conn, %{
        "user" => %{"email" => email, "password" => password, "remember_me" => _remember_me}
      }) do
    case AuthGuardian.authenticate(email, password) do
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

  # Just in case...
  def login(conn, %{"user" => %{"email" => email, "password" => password}}) do
    login(conn, %{"email" => email, "password" => password, "remember_me" => false})
  end

  def refresh_session(conn, _params) do
    old_token = Guradian.Plug.current_token(conn)

    case Guaridan.decode_and_verify(old_token) do
      {:ok, claims} ->
        case Guardian.resource_from_claims(claims) do
          {:ok, user} ->
            {:ok, _old, {new_token, _new_claims}} = Guardian.refresh(old_token)

            conn
            |> AuthGuardian.Plug.sign_in(user)
            |> put_status(:ok)
            |> put_view(ApiWeb.UserJSON)
            |> render(:show_with_token, %{user: user, token: new_token})

          {:error, _reason} ->
            conn
            |> put_status(:unauthorized)
            |> json(%{error: "Invalid token"})
        end

      {:error, _reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Resource not found"})
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
