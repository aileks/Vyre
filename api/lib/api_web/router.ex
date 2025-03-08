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

  pipeline :browser do
    plug(:accepts, ["html"])
  end

  scope "/api", ApiWeb do
    pipe_through(:api)

    resources("/users", UserController)
  end

  scope "/api/auth", ApiWeb do
    # Public auth routs
    pipe_through(:api)
    post("/register", AuthController, :register)
    post("/login", AuthController, :login)
    delete("/logout", AuthController, :logout)

    # Protected auth routes
    pipe_through(:auth)
    get("/me", AuthController, :me)
  end

  scope "/", ApiWeb do
    pipe_through(:browser)
    get("/*path", PageController, :index)
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
