defmodule ApiWeb.Auth.Guardian do
  use Guardian, otp_app: :api

  alias Api.Accounts

  def after_encode_and_sign(resource, claims, token, _options) do
    with {:ok, _} <- Guardian.DB.after_encode_and_sign(resource, claims["typ"], claims, token) do
      {:ok, token}
    end
  end

  def on_verify(claims, token, _options) do
    with {:ok, _} <- Guardian.DB.on_verify(claims, token) do
      {:ok, claims}
    end
  end

  def on_refresh({old_token, old_claims}, {new_token, new_claims}, _options) do
    with {:ok, _, _} <- Guardian.DB.on_refresh({old_token, old_claims}, {new_token, new_claims}) do
      {:ok, {old_token, old_claims}, {new_token, new_claims}}
    end
  end

  def on_revoke(claims, token, _options) do
    with {:ok, _} <- Guardian.DB.on_revoke(claims, token) do
      {:ok, claims}
    end
  end

  def subject_for_token(%{id: id}, _claims) do
    sub = to_string(id)
    {:ok, sub}
  end

  def subject_for_token(_, _) do
    {:error, :missing_id}
  end

  def resource_from_claims(%{"sub" => id}) do
    case Accounts.get_user!(id) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  @doc """
  Create an access token for a user.

  Returns tuple with token string and expiration timestamp.
  """
  # Set appropriate TTL based on remember_me flag
  def create_token(user, remember_me \\ false) do
    ttl = if remember_me, do: {30, :days}, else: {1, :hour}

    case encode_and_sign(user, %{}, token_type: "access", ttl: ttl) do
      {:ok, token, claims} ->
        {token, claims["exp"]}

      _error ->
        {nil, nil}
    end
  end

  @doc """
  Creates a refresh token for a user.

  Returns tuple with token string and expiration timestamp.
  """
  def create_refresh_token(user) do
    case encode_and_sign(user, %{}, token_type: "refresh", ttl: {30, :days}) do
      {:ok, token, claims} ->
        {token, claims["exp"]}

      _error ->
        {nil, nil}
    end
  end

  @doc """
  Decodes a token and fetches the associated resource.

  Returns {:ok, resource} or {:error, reason}
  """
  def get_resource_from_token(token, token_type \\ "access") do
    case resource_from_token(token, %{"typ" => token_type}) do
      {:ok, resource, _claims} -> {:ok, resource}
      error -> error
    end
  end

  @doc """
  Revokes a token, making it invalid for future use.

  Uses Guardian.DB to track the revocation.
  """
  def revoke_token(token) do
    case revoke(token) do
      {:ok, _claims} -> {:ok, :revoked}
      error -> error
    end
  end

  @doc """
  Exchanges a refresh token for a new access token.

  When successful, the old refresh token is revoked and a new token pair is issued.
  """
  def exchange_refresh_for_access_token(refresh_token) do
    # First verify the refresh token is valid
    case decode_and_verify(refresh_token, %{"typ" => "refresh"}) do
      {:ok, claims} ->
        # Then get the user from the token
        case resource_from_claims(claims) do
          {:ok, user} ->
            # Revoke the old refresh token first
            revoke(refresh_token)

            # Create new token pair
            {access_token, access_exp} = create_token(user)
            {refresh_token, refresh_exp} = create_refresh_token(user)

            # Return everything needed by the client
            {:ok, access_token, access_exp, refresh_token, refresh_exp}

          error ->
            error
        end

      error ->
        error
    end
  end

  @doc """
  Validates a token without loading the resource.

  Returns {:ok, claims} or {:error, reason}
  """
  def validate_token(token, token_type \\ "access") do
    decode_and_verify(token, %{"typ" => token_type})
  end
end
