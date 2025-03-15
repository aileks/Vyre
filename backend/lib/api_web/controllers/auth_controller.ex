defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias Api.Accounts
  alias Api.Guardian

  action_fallback(ApiWeb.FallbackController)

  @cookie_opts [
    http_only: true,
    secure: Application.compile_env(:api, :env) != :dev,
    # 7 days
    max_age: 604_800,
    same_site: "Lax",
    path: "/"
  ]

  @refresh_cookie_opts [
    http_only: true,
    secure: Application.compile_env(:api, :env) != :dev,
    # 30 days
    max_age: 2_592_000,
    same_site: "Lax",
    path: "/"
  ]

  def register(conn, params) do
    user_params = params["user"]

    case Accounts.register_user(user_params) do
      {:ok, user} ->
        # Generate tokens
        {:ok, token, %{"exp" => exp} = _claims} =
          Guardian.encode_and_sign(user, %{}, token_type: "access")

        {:ok, refresh_token, %{"exp" => refresh_exp} = _refresh_claims} =
          Guardian.encode_and_sign(user, %{}, token_type: "refresh")

        # Convert UNIX timestamp to DateTime
        expiry = DateTime.from_unix!(exp)
        refresh_expires_at = DateTime.from_unix!(refresh_exp)

        conn
        |> put_resp_cookie("_auth_token", token, @cookie_opts)
        |> put_resp_cookie("_auth_refresh_token", refresh_token, @refresh_cookie_opts)
        |> put_status(:created)
        |> put_view(ApiWeb.AuthJSON)
        |> render(:user_with_token_info, %{
          user: user,
          expires_at: expiry,
          refresh_expires_at: refresh_expires_at
        })

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> put_view(json: ApiWeb.ChangesetJSON)
        |> render("error.json", changeset: changeset)
    end
  end

  def login(conn, %{"user" => %{"email" => email, "password" => password}}) do
    with {:ok, user} <- Accounts.authenticate_user(email, password) do
      # Generate tokens
      {:ok, token, %{"exp" => exp} = _claims} =
        Guardian.encode_and_sign(user, %{}, token_type: "access")

      {:ok, refresh_token, %{"exp" => refresh_exp} = _refresh_claims} =
        Guardian.encode_and_sign(user, %{}, token_type: "refresh")

      # Convert UNIX timestamp to DateTime
      expiry = DateTime.from_unix!(exp)
      refresh_expires_at = DateTime.from_unix!(refresh_exp)

      conn
      |> put_resp_cookie("_auth_token", token, @cookie_opts)
      |> put_resp_cookie("_auth_refresh_token", refresh_token, @refresh_cookie_opts)
      |> put_status(:ok)
      |> put_view(ApiWeb.AuthJSON)
      |> render(:user_with_token_info, %{
        user: user,
        expires_at: expiry,
        refresh_expires_at: refresh_expires_at
      })
    else
      _ ->
        conn
        |> put_status(:unauthorized)
        |> put_view(json: ApiWeb.ErrorJSON)
        |> render("401.json", %{error: "Invalid credentials"})
    end
  end

  def logout(conn, _params) do
    # Delete auth cookies
    conn
    |> delete_resp_cookie("_auth_token", @cookie_opts)
    |> delete_resp_cookie("_auth_refresh_token", @refresh_cookie_opts)
    |> put_status(:ok)
    |> json(%{message: "Successfully logged out"})
  end

  def refresh(conn, _params) do
    conn = fetch_cookies(conn)
    refresh_token = conn.private[:api_auth_refresh_token] || conn.cookies["_auth_refresh_token"]

    if is_nil(refresh_token) do
      conn
      |> put_status(:unauthorized)
      |> put_view(json: ApiWeb.ErrorJSON)
      |> render("401.json", %{error: "Missing refresh token"})
    else
      with {:ok, claims} <- Guardian.decode_and_verify(refresh_token, %{"typ" => "refresh"}),
           {:ok, _old_stuff, {token, %{"exp" => exp} = _claims}} <-
             Guardian.exchange(refresh_token, "refresh", "access"),
           {:ok, {_old_token, _old_claims},
            {new_refresh_token, %{"exp" => refresh_exp} = _refresh_claims}} <-
             Guardian.refresh(refresh_token),
           {:ok, user} <- Guardian.resource_from_claims(%{"sub" => claims["sub"]}) do
        expiry = DateTime.from_unix!(exp)
        refresh_expires_at = DateTime.from_unix!(refresh_exp)

        conn
        |> Guardian.Plug.sign_in(user, %{}, token_type: "access")
        |> put_resp_cookie("_auth_token", token, @cookie_opts)
        |> put_resp_cookie("_auth_refresh_token", new_refresh_token, @refresh_cookie_opts)
        |> put_status(:ok)
        |> json(%{
          user: %{
            id: user.id,
            email: user.email,
            username: user.username,
            password_hash: user.password_hash,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            status: user.status
          },
          access_token: token,
          refresh_token: new_refresh_token,
          expires_at: expiry,
          refresh_expires_at: refresh_expires_at
        })
      else
        error ->
          conn
          |> delete_resp_cookie("_auth_token", @cookie_opts)
          |> delete_resp_cookie("_auth_refresh_token", @refresh_cookie_opts)
          |> put_status(:unauthorized)
          |> put_view(json: ApiWeb.ErrorJSON)
          |> render("401.json", %{error: "Session expired"})
      end
    end
  end

  def me(conn, _params) do
    conn = fetch_cookies(conn)

    case Guardian.Plug.current_resource(conn) do
      nil ->
        case Guardian.decode_and_verify(conn) do
          {:ok, user} ->
            conn
            |> put_status(:ok)
            |> put_view(json: ApiWeb.AuthJSON)
            |> render(:user, %{user: user})

          {:error, reason} ->
            conn
            |> put_status(:unauthorized)
            |> put_view(json: ApiWeb.ErrorJSON)
            |> render("401.json", %{error: "Not authenticated"})
        end

      user ->
        conn
        |> put_status(:ok)
        |> put_view(json: ApiWeb.AuthJSON)
        |> render(:user, %{user: user})
    end
  end
end
