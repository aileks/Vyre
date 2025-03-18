defmodule ApiWeb.Auth.Pipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: ApiWeb.Auth.ErrorHandler,
    module: ApiWeb.Auth.Guardian

  plug(:fetch_session)
  plug(:fetch_cookies)

  plug(Guardian.Plug.VerifySession, claims: %{"typ" => "access"})

  plug(Guardian.Plug.VerifySession,
    refresh_from_cookie: "_auth_refresh_token",
    exchange_from: "refresh",
    exchange_to: "access"
  )

  plug(Guardian.Plug.LoadResource, allow_blank: true)
  plug(Guardian.Plug.EnsureAuthenticated, claims: %{"typ" => "access"})
end
