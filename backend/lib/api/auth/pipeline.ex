defmodule Api.Auth.Pipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: Api.Auth.ErrorHandler,
    module: Api.Guardian

  # If there is a session token, restrict it to an access token and validate it
  plug(Guardian.Plug.VerifySession, claims: %{"typ" => "access"})

  # If there is an authorization header, it must be a Bearer token
  plug(Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"})

  # Check for the auth cookie
  plug(Guardian.Plug.VerifyCookie, key: "_auth_token", claims: %{"typ" => "access"})

  # Load the user if either of the verifications worked
  plug(Guardian.Plug.LoadResource, allow_blank: true)
end

defmodule Api.Auth.AuthenticatedPipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: Api.Auth.ErrorHandler,
    module: Api.Guardian

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
    module: Api.Guardian

  # Check specifically for the refresh token in cookie
  plug(Api.Auth.VerifyRefreshCookiePlug)
end
