defmodule ApiWeb.Auth.VerifyRefreshCookiePlug do
  import Plug.Conn

  @doc """
  Looks for and verifies a refresh token in the cookie
  """
  def init(opts), do: opts

  def call(conn, _opts) do
    # First, fetch cookies to ensure they're accessible
    conn = fetch_cookies(conn)

    # Now safely access the cookies
    with refresh_token when not is_nil(refresh_token) <- conn.cookies["_auth_refresh_token"],
         {:ok, claims} <- Api.Guardian.decode_and_verify(refresh_token, %{"typ" => "refresh"}) do
      # Store this information for later use
      conn
      |> put_private(:api_auth_refresh_token, refresh_token)
      |> put_private(:api_auth_refresh_claims, claims)
    else
      nil ->
        conn

      {:error, _reason} ->
        conn
    end
  end
end
