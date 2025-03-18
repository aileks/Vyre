defmodule ApiWeb.AuthController do
  use ApiWeb, :controller
  alias Api.Accounts
  alias ApiWeb.Auth.Guardian

  action_fallback(ApiWeb.FallbackController)

  @cookie_opts [
    http_only: true,
    secure: System.get_env("MIX_ENV") != :dev,
    # 7 days
    max_age: 604_800,
    same_site: "Lax",
    path: "/"
  ]

  @refresh_cookie_opts [
    http_only: true,
    secure: System.get_env("MIX_ENV") != :dev,
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
        # Simplified this - Guardian will handle type
        |> Guardian.Plug.sign_in(user)
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
      {:ok, token, %{"exp" => exp} = claims} =
        Guardian.encode_and_sign(user, %{}, token_type: "access")

      {:ok, refresh_token, %{"exp" => refresh_exp}} =
        Guardian.encode_and_sign(user, %{}, token_type: "refresh")

      conn = Guardian.Plug.sign_in(conn, user, claims)
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
    conn
    |> Guardian.Plug.sign_out()
    |> delete_resp_cookie("_auth_token")
    |> delete_resp_cookie("_auth_refresh_token")
    |> clear_session()
    |> configure_session(drop: true)
    |> put_status(:ok)
    |> json(%{message: "Successfully logged out"})
  end

  # Simplified refresh function
  def refresh(conn, _params) do
    refresh_token = conn.cookies["_auth_refresh_token"]

    if is_nil(refresh_token) do
      conn
      |> put_status(:unauthorized)
      |> json(%{error: "Missing refresh token"})
    else
      case Guardian.decode_and_verify(refresh_token, %{"typ" => "refresh"}) do
        {:ok, claims} ->
          # Get the user from claims
          case Guardian.resource_from_claims(claims) do
            {:ok, user} ->
              # Create new tokens
              {:ok, token, %{"exp" => exp}} =
                Guardian.encode_and_sign(user, %{}, token_type: "access")

              {:ok, new_refresh, %{"exp" => refresh_exp}} =
                Guardian.encode_and_sign(user, %{}, token_type: "refresh")

              expiry = DateTime.from_unix!(exp)
              refresh_expiry = DateTime.from_unix!(refresh_exp)

              # Sign in user with new token
              conn
              |> Guardian.Plug.sign_in(user)
              |> put_resp_cookie("_auth_token", token, @cookie_opts)
              |> put_resp_cookie("_auth_refresh_token", new_refresh, @refresh_cookie_opts)
              |> put_status(:ok)
              |> put_view(ApiWeb.AuthJSON)
              |> render(:user_with_token_info, %{
                user: user,
                expires_at: expiry,
                refresh_expires_at: refresh_expiry
              })

            {:error, _} ->
              conn
              |> put_status(:unauthorized)
              |> json(%{error: "Invalid refresh token"})
          end

        {:error, _} ->
          conn
          |> put_status(:unauthorized)
          |> json(%{error: "Invalid refresh token"})
      end
    end
  end

  @doc """
  Returns the current user if they exist
  """
  def me(conn, _params) do
    # NOTE: This hacky af
    token =
      case conn.cookies["_auth_token"] do
        nil -> Guardian.Plug.current_token(conn)
        token -> token
      end

    case token do
      nil ->
        conn
        |> put_status(:ok)
        |> json(%{user: nil})

      token ->
        case Guardian.decode_and_verify(token) do
          {:ok, claims} ->
            case Guardian.resource_from_claims(claims) do
              {:ok, user} ->
                conn
                |> put_status(:ok)
                |> put_view(ApiWeb.AuthJSON)
                |> render(:user, %{user: user})

              # If resource lookup fails, return a null user.
              _error ->
                conn
                |> put_status(:ok)
                |> json(%{user: nil})
            end

          # If token verification fails, return a null user.
          {:error, _reason} ->
            conn
            |> put_status(:ok)
            |> json(%{user: nil})
        end
    end
  end
end
