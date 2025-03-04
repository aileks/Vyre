defmodule ApiWeb.Router do
  use ApiWeb, :router
  use Plug.ErrorHandler

  pipeline :api do
    plug(:accepts, ["json"])
  end

  pipeline :auth do
    plug(:accepts, ["json"])
    plug(ApiWeb.AuthPlug)
  end

  scope "/api", ApiWeb do
    pipe_through(:api)

    resources("/users", UserController)
    post("/register", AuthController, :register)
    post("/login", AuthController, :login)
  end

  scope "/api", ApiWeb do
    pipe_through([:api, :auth])

    get("/me", AuthController, :me)
  end

  def handle_errors(conn, %{reason: %Ecto.NoResultsError{} = _reason}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("404.json", %{message: "Resource not found"})
    |> halt()
  end

  def handle_errors(conn, _) do
    conn
    |> put_status(:internal_server_error)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("500.json")
    |> halt()
  end
end
