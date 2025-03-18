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

  def authenticate(email, password) do
    case Accounts.get_user_by_email!(email) do
      nil ->
        Bcrypt.no_user_verify()
        {:error, "Invalid credentials"}

      user ->
        case Accounts.validate_password(password, user.password_hash) do
          true -> create_token(user)
          false -> {:error, "Invalid credentials"}
        end
    end
  end

  def create_token(user) do
    {:ok, token, _claims} = encode_and_sign(user)
    {:ok, user, token}
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
