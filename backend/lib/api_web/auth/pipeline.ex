defmodule ApiWeb.Auth.Pipeline do
  @claims %{"typ" => "access"}

  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: ApiWeb.Auth.ErrorHandler,
    module: ApiWeb.Auth.Guardian

  plug(Guardian.Plug.VerifySession, claims: @claims)
  plug(Guardian.Plug.VerifyHeader, claims: @claims)
  plug(Guardian.Plug.EnsureAuthenticated, claims: @claims)
  plug(Guardian.Plug.LoadResource)
end
