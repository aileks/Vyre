defmodule Api.Auth.Pipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: Api.Auth.ErrorHandler,
    module: ApiWeb.Auth.Guardian

  plug(:fetch_cookies)
  plug(Guardian.Plug.VerifyCookie, key: "_auth_token")
  plug(Guardian.Plug.EnsureAuthenticated)
  plug(Guardian.Plug.LoadResource)
end
