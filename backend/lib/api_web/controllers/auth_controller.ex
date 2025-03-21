defmodule ApiWeb.AuthController do
  use ApiWeb, :controller

  alias ApiWeb.Auth.Guardian, as: AuthGuardian
  alias Api.Accounts
  alias Api.RateLimit

  action_fallback(ApiWeb.FallbackController)

  def register(conn, params) do
    IO.inspect(params, label: "Register Params")
    ip_string = conn.remote_ip |> :inet.ntoa() |> to_string()
    key = "register:#{ip_string}"
    scale = :timer.minutes(1)
    limit = 3

    handle_rate_limit(conn, key, scale, limit, fn ->
      case Accounts.register_user(params) do
        {:ok, user} ->
          {:ok, user, token} = AuthGuardian.create_token(user, :access)

          conn
          |> AuthGuardian.Plug.sign_in(user)
          |> put_status(:created)
          |> put_view(ApiWeb.UserJSON)
          |> render(:show_with_token, %{user: user, token: token})

        {:error, changeset} ->
          {:error, changeset}
      end
    end)
  end

  def login(conn, %{"user" => %{"email" => email, "password" => password} = params}) do
    ip_string = conn.remote_ip |> :inet.ntoa() |> to_string()
    key = "login:#{ip_string}"
    scale = :timer.minutes(3)
    limit = 5

    handle_rate_limit(conn, key, scale, limit, fn ->
      remember_me = Map.get(params, "remember_me", false)

      case AuthGuardian.authenticate(email, password, remember_me) do
        {:ok, user, token} ->
          conn
          |> AuthGuardian.Plug.sign_in(user)
          |> put_status(:ok)
          |> put_view(ApiWeb.UserJSON)
          |> render(:show_with_token, %{user: user, token: token})

        {:error, _reason} ->
          # Track failed login attempts separately
          failed_key = "failed_login:#{email}:#{ip_string}"
          RateLimit.hit(failed_key, :timer.hours(24), 20)

          conn
          |> put_status(:unauthorized)
          |> json(%{error: "Invalid credentials"})
      end
    end)
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
          |> put_view(json: ApiWeb.ErrorJSON)
          |> render("500.json")
      end
    end
  end

  def logout(conn, _params) do
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

  defp handle_rate_limit(conn, key, scale, limit, action_fn) do
    case RateLimit.hit(key, scale, limit) do
      {:allow, _count} ->
        action_fn.()

      {:deny, retry_after} ->
        retry_after_seconds = div(retry_after, 1000)

        conn
        |> put_resp_header("retry-after", Integer.to_string(retry_after_seconds))
        |> put_status(:too_many_requests)
        |> json(%{
          error: "Limit exceeded. Please try again later.",
          retry_after_seconds: retry_after_seconds
        })
        |> halt()
    end
  end
end
