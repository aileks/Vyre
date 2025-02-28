defmodule VyreWeb.Router do
  use VyreWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", VyreWeb do
    pipe_through :api
    resources "/messages", MessageController, only: [:index, :create]
  end

  get "/*path", VyreWeb.PageController, :index

  # Enable Swoosh mailbox preview in development
  if Application.compile_env(:vyre, :dev_routes) do

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
