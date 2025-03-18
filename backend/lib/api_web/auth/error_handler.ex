defmodule ApiWeb.Auth.ErrorHandler do
  import Plug.Conn
  import Phoenix.Controller

  @behaviour Guardian.Plug.ErrorHandler

  @impl Guardian.Plug.ErrorHandler
  def auth_error(conn, {_type, _reason}, _opts) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("401.json", %{error: "Unauthorized"})
  end
end
