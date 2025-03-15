defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias Api.Accounts
  alias Api.Accounts.Guardian

  action_fallback(ApiWeb.FallbackController)

  def register(conn, %{"user" => user_params}) do
    with {:ok, user} <- Accounts.register_user(user_params) do
      {token, exp} = Guardian.create_token(user)
      {refresh_token, refresh_exp} = Guardian.create_refresh_token(user)

      conn
      |> put_status(:created)
      |> render(:user_with_token, %{
        user: user,
        token: token,
        expiry: exp,
        refresh_token: refresh_token,
        refresh_expires_at: refresh_exp
      })
    end
  end

  def login(conn, %{
        "user" => %{"email" => email, "password" => password, "rememberMe" => remember_me}
      }) do
    with {:ok, user} <- Accounts.authenticate_user(email, password),
         {token, exp} <- Guardian.create_token(user, remember_me),
         {refresh_token, refresh_exp} <- Guardian.create_refresh_token(user) do
      conn
      |> put_status(:ok)
      |> render(:user_with_token, %{
        user: user,
        token: token,
        expiry: exp,
        refresh_token: refresh_token,
        refresh_expires_at: refresh_exp
      })
    end
  end

  def logout(conn, _params) do
    token = Guardian.Plug.current_token(conn)

    if token do
      case Guardian.revoke(token) do
        {:ok, _claims} ->
          conn
          |> put_status(:ok)
          |> json(%{message: "Logged out successfully"})

        {:error, reason} ->
          conn
          |> put_status(:bad_request)
          |> json(%{error: "Logout failed: #{inspect(reason)}"})
      end
    else
      conn
      |> put_status(:ok)
      |> json(%{message: "No active session to logout"})
    end
  end

  def me(conn, _params) do
    case Guardian.Plug.current_resource(conn) do
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Unauthorized"})

      user ->
        render(conn, :user, %{user: user})
    end
  end

  def refresh(conn, %{"refresh_token" => refresh_token}) do
    case Guardian.decode_and_verify(refresh_token, %{"typ" => "refresh"}) do
      {:ok, claims} ->
        # Extract the user from claims
        case Guardian.resource_from_claims(claims) do
          {:ok, user} ->
            # Add a check for token age to prevent frequent refreshes
            token_age = current_time() - (claims["iat"] || 0)
            # Only allow refresh if token is at least 60 seconds old
            min_age_for_refresh = 60

            if token_age < min_age_for_refresh do
              # Return an error for too frequent refreshes
              conn
              |> put_status(:too_many_requests)
              |> json(%{
                error: "Too frequent token refreshes",
                message: "Please wait before refreshing again",
                retryAfter: min_age_for_refresh - token_age
              })
            else
              # Revoke the old refresh token first (this updates Guardian.DB)
              Guardian.revoke(refresh_token)

              # Create new tokens
              {token, exp} = Guardian.create_token(user)
              {new_refresh_token, refresh_exp} = Guardian.create_refresh_token(user)

              conn
              |> put_status(:ok)
              |> render(:refresh_token, %{
                token: token,
                refresh_token: new_refresh_token,
                expires_at: exp,
                refresh_expires_at: refresh_exp
              })
            end

          {:error, reason} ->
            conn
            |> put_status(:unauthorized)
            |> json(%{error: "Invalid user in refresh token: #{inspect(reason)}"})
        end

      {:error, reason} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid refresh token: #{inspect(reason)}"})
    end
  end

  defp current_time do
    DateTime.utc_now() |> DateTime.to_unix()
  end
end
