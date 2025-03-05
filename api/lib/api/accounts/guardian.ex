defmodule Api.Auth.Guardian do
  use Guardian, otp_app: :api

  alias Api.Accounts

  def subject_for_token(user, _claims) do
    {:ok, to_string(user.id)}
  end

  def subject_for_token(_resource, _claims) do
    {:error, :invalid_resource}
  end

  def resource_from_claims(%{"sub" => id}) do
    Accounts.get_user(id)
  end

  def resource_from_claims(_claims) do
    {:error, :invalid_claims}
  end

  def create_token(user, claims \\ %{}) do
    claims = Map.merge(claims, %{"typ" => "access"})

    Guardian.encode_and_sign(__MODULE__, user, claims)
  end

  def get_resource_from_token(token) do
    case decode_and_verify(token) do
      {:ok, claims} -> resource_from_claims(claims)
      error -> error
    end
  end
end
