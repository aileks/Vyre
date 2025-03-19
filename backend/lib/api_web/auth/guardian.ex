defmodule ApiWeb.Auth.Guardian do
  use Guardian, otp_app: :api

  alias Api.Accounts
  alias Api.Accounts.User

  def subject_for_token(%User{id: id}, _claims) do
    {:ok, "#{id}"}
  end

  def subject_for_token(_, _), do: {:error, :unhandled_resource_type}

  def resource_from_claims(%{"sub" => id}) do
    case Accounts.get_user!(id) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  def resource_from_claims(_), do: {:error, :unhandled_resource_type}

  def authenticate(email, password, remember_me) do
    case Accounts.get_user_by_email!(email) do
      nil ->
        Bcrypt.no_user_verify()
        {:error, "Invalid credentials"}

      user ->
        token_type = if remember_me, do: :refresh, else: :access

        case Accounts.validate_password(password, user.password_hash) do
          true -> create_token(user, token_type)
          false -> {:error, "Invalid credentials"}
        end
    end
  end

  def authenticate(token) do
    with {:ok, claims} <- decode_and_verify(token),
         {:ok, user} <- resource_from_claims(claims),
         {:ok, _old, {new_token, _claims}} <- refresh(token) do
      {:ok, user, new_token}
    end
  end

  def create_token(user, type) do
    {:ok, token, _claims} = encode_and_sign(user, %{}, token_opts(type))
    {:ok, user, token}
  end

  def token_opts(type) do
    case type do
      :access -> [token_type: "access", ttl: {7, :day}]
      :refresh -> [token_type: "refresh", ttl: {30, :day}]
      :reset -> [token_type: "reset", ttl: {15, :minute}]
    end
  end

  def revoke_all(resource, claims) do
    with {:ok, _sub} <- subject_for_token(resource, claims) do
      Guardian.DB.revoke_all(resource)
    end
  end

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
end
