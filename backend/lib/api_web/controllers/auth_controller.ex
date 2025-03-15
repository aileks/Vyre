defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias Api.Accounts
  alias Api.Guardian

  action_fallback(ApiWeb.FallbackController)

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
        |> put_status(:created)
        |> put_view(ApiWeb.AuthJSON)
        |> render(:user_with_token, %{
          user: user,
          token: token,
          expiry: expiry,
          refresh_token: refresh_token,
          refresh_expires_at: refresh_expires_at
        })

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> put_view(json: ApiWeb.ChangesetJSON)
        |> render("error.json", changeset: changeset)
    end
  end

  # def register(conn, %{"user" => user_params}) do
  #   with {:ok, user} <- Accounts.register_user(user_params) do
  #     {token, exp} = Guardian.create_token(user)
  #     {refresh_token, refresh_exp} = Guardian.create_refresh_token(user)

  #     conn
  #     |> put_status(:created)
  #     |> render(:user_with_token, %{
  #       user: user,
  #       token: token,
  #       expiry: exp,
  #       refresh_token: refresh_token,
  #       refresh_expires_at: refresh_exp
  #     })
  #   end
  # end

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
      |> put_status(:ok)
      |> put_view(ApiWeb.AuthJSON)
      |> render(:user_with_token, %{
        user: user,
        token: token,
        expiry: expiry,
        refresh_token: refresh_token,
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

  # def login(conn, %{
  #       "user" => %{"email" => email, "password" => password, "rememberMe" => remember_me}
  #     }) do
  #   with {:ok, user} <- Accounts.authenticate_user(email, password),
  #        {token, exp} <- Guardian.create_token(user, remember_me),
  #        {refresh_token, refresh_exp} <- Guardian.create_refresh_token(user) do
  #     conn
  #     |> put_status(:ok)
  #     |> render(:user_with_token, %{
  #       user: user,
  #       token: token,
  #       expiry: exp,
  #       refresh_token: refresh_token,
  #       refresh_expires_at: refresh_exp
  #     })
  #   end
  # end

  def logout(conn, %{"refresh_token" => refresh_token}) do
    # Decode without verifying to get claims even if token expired
    case Guardian.decode_and_verify(refresh_token) do
      {:ok, _claims} ->
        # Revoke the token
        Guardian.revoke(refresh_token)

        conn
        |> put_status(:ok)
        |> json(%{message: "Successfully logged out"})

      {:error, _reason} ->
        # Even if token is invalid, return success to prevent user confusion
        conn
        |> put_status(:ok)
        |> json(%{message: "Successfully logged out"})
    end
  end

  # def logout(conn, _params) do
  #   token = Guardian.Plug.current_token(conn)

  #   if token do
  #     case Guardian.revoke(token) do
  #       {:ok, _claims} ->
  #         conn
  #         |> put_status(:ok)
  #         |> json(%{message: "Logged out successfully"})

  #       {:error, reason} ->
  #         conn
  #         |> put_status(:bad_request)
  #         |> json(%{error: "Logout failed: #{inspect(reason)}"})
  #     end
  #   else
  #     conn
  #     |> put_status(:ok)
  #     |> json(%{message: "No active session to logout"})
  #   end
  # end

  def refresh(conn, %{"refresh_token" => refresh_token}) do
    # Verify and exchange the refresh token
    with {:ok, _claims} <- Guardian.decode_and_verify(refresh_token, %{"typ" => "refresh"}),
         {:ok, _old_stuff, {token, %{"exp" => exp} = _claims}} <-
           Guardian.exchange(refresh_token, "refresh", "access"),
         # Generate a new refresh token too
         {:ok, new_refresh_token, %{"exp" => refresh_exp} = _refresh_claims} <-
           Guardian.refresh(refresh_token) do
      # Convert UNIX timestamp to DateTime
      expiry = DateTime.from_unix!(exp)
      refresh_expires_at = DateTime.from_unix!(refresh_exp)

      conn
      |> put_status(:ok)
      |> put_view(ApiWeb.AuthJSON)
      |> render(:tokens, %{
        access_token: token,
        refresh_token: new_refresh_token,
        expires_at: expiry,
        refresh_expires_at: refresh_expires_at
      })
    else
      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> put_view(json: ApiWeb.ErrorJSON)
        |> render("401.json", %{error: to_string(reason)})
    end
  end

  def me(conn, _params) do
    user = Guardian.Plug.current_resource(conn)

    conn
    |> put_status(:ok)
    |> put_view(ApiWeb.AuthJSON)
    |> render(:user, %{user: user})
  end
end
