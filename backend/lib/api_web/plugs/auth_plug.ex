defmodule ApiWeb.AuthPlug do
  @moduledoc """
    A plug that enforces authentication on routes where it's applied.

    It extracts the Bearer token from the Authorization header, verifies
    the token and identifies the user, then makes the user available to
    the controller. If authentication fails, it returns a 401 Unauthorized
    response.

    ## Usage

    ```elixir
    # In your router.ex
    pipeline :api_auth do
      plug :accepts, ["json"]
      plug ApiWeb.AuthPlug
    end

    # Authenticated routes
    scope "/api", ApiWeb do
      pipe_through [:api, :api_auth]

      get "/me", AuthController, :me
      # Other protected routes...
    end

  """

  import Plug.Conn
  import Phoenix.Controller

  alias Api.Accounts

  @doc """
  Initializes the plug with options.

  This function is called at compile time and passes options to call/2.
  We're not using any options in this plug, but it's required by the Plug spec.
  """
  def init(opts), do: opts

  @doc """
  Processes the connection at runtime for each request.

  Extracts the Bearer token from the Authorization header, verifies it,
  and assigns the current user to the connection if successful. Otherwise,
  returns a 401 Unauthorized response and halts the plug pipeline.
  """
  def call(conn, _opts) do
    case get_authorization_header(conn) do
      {"Bearer " <> token, :ok} ->
        case Accounts.get_current_user(token) do
          {:ok, user} ->
            assign(conn, :current_user, user)

          {:error, _reason} ->
            handle_unauthorized(conn)
        end

      _other ->
        handle_unauthorized(conn)
    end
  end

  # Extracts and validates the authorization header from the request.
  # Returns either a tuple {header_value, :ok} if a single valid header is found,
  # or :error if no header or multiple headers are present.
  defp get_authorization_header(conn) do
    case get_req_header(conn, "authorization") do
      [header] -> {header, :ok}
      _ -> :error
    end
  end

  # Handles unauthorized access by returning a 401 Unauthorized response.
  # Sets the HTTP status to 401, renders the error JSON response using
  # ApiWeb.ErrorJSON, and halts the plug pipeline to prevent further processing.
  defp handle_unauthorized(conn) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("401.json")
    |> halt()
  end
end
