defmodule Api.Auth.Pipeline do
  @claims %{typ: "access"}

  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: Api.Auth.ErrorHandler,
    module: ApiWeb.Auth.Guardian

  # If there is an authorization header, it must be a Bearer token
  plug(Guardian.Plug.VerifyHeader, claims: @claims, scheme: "Bearer")

  # If there is a session token, restrict it to an access token and validate it
  plug(Guardian.Plug.VerifySession, claims: @claims)

  # Check for the auth cookie
  plug(Guardian.Plug.VerifyCookie, key: "_auth_token", claims: @claims)

  # Load the user if either of the verifications worked
  plug(Guardian.Plug.LoadResource, ensure: true)
end

defmodule Api.Auth.AuthenticatedPipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: Api.Auth.ErrorHandler,
    module: ApiWeb.Auth.Guardian

  # Verify the token
  plug(Guardian.Plug.VerifySession, claims: %{"typ" => "access"})
  plug(Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"})
  plug(Guardian.Plug.VerifyCookie, key: "_auth_token", claims: %{"typ" => "access"})

  # Load the user from the token
  plug(Guardian.Plug.LoadResource)

  # Ensure we found a valid user
  plug(Guardian.Plug.EnsureAuthenticated)
end

defmodule Api.Auth.RefreshablePipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: Api.Auth.ErrorHandler,
    module: ApiWeb.Auth.Guardian

  # Check specifically for the refresh token in cookie
  plug(Api.Auth.VerifyRefreshCookiePlug)
end
