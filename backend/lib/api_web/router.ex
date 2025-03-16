defmodule ApiWeb.Router do
  use ApiWeb, :router
  use Plug.ErrorHandler

  pipeline :api do
    plug(:accepts, ["json"])
    plug(:fetch_cookies)
  end

  pipeline :auth do
    plug(Api.Auth.Pipeline)
  end

  pipeline :browser do
    plug(:accepts, ["html"])
  end

  scope "/api", ApiWeb do
    # Public Routes
    pipe_through(:api)
    post("/users/new", AuthController, :register)
    post("/session", AuthController, :login)
    get("/user/current", AuthController, :me)

    # Protected Routes
    pipe_through(:auth)
    delete("/session", AuthController, :logout)
    post("/session/refresh", AuthController, :refresh)
    resources("/users", UserController, except: [:new, :edit])
    # resources("/servers", ServerController)
    # resources("/servers/:server_id/channels", ChannelController, except: [:new, :edit])
    # post("/friends/send_request", FriendController, :send_request)
    # post("/friends/accept_request", FriendController, :accept_request)
    # delete("/friends/decline_request", FriendController, :decline_request)
    # get("/friends/list", FriendController, :list_friends)
    # get("/friends/pending_requests", FriendController, :list_pending_requests)
  end

  # Catch-All for Frontend Routes
  scope "/", ApiWeb do
    pipe_through(:browser)
    get("/*path", PageController, :index)
  end
end
