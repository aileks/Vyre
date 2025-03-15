defmodule ApiWeb.AuthPlug do
  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: Api.Guardian.ErrorHandler,
    module: Api.Guardian

  plug(Guardian.Plug.VerifyHeader, scheme: "Bearer")
  plug(Guardian.Plug.VerifyCookie, key: "_auth_token")
  plug(Guardian.Plug.LoadResource, allow_blank: true)
end
