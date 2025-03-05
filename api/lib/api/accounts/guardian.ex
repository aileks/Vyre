defmodule Api.Auth.Guardian do
  use Guardian, otp_app: :api

  alias Api.Accounts, as: Accounts

  def subject_for_token(%Accounts.User{} = user, _claims) do
    {:ok, to_string(user.id)}
  end

  def subject_for_token(_resource, _claims) do
    {:error, :unknown_resource}
  end

  def resource_from_claims(%{"sub" => id}) do
    Accounts.get_user(id)
  end

  def resource_from_claims(_claims) do
    {:error, :invalid_claims}
  end

  # def create_token(user, _claims \\ %{}) do
  #   case encode_and_sign(user, %{}, ttl: {1, :hour}) do
  #     {:ok, token, _claims} -> {:ok, token}
  #     error -> error
  #   end
  # end
  def create_token(user) do
    {:ok, token, _claims} = encode_and_sign(user, %{}, ttl: {1, :hour})
    token
  end

  def create_refresh_token(user, _claims \\ %{}) do
    {:ok, token, _claims} = encode_and_sign(user, %{type: "refresh"}, ttl: {1, :month})
    token
  end

  def get_resource_from_token(token) do
    case decode_and_verify(token) do
      {:ok, claims} -> resource_from_claims(claims)
      error -> error
    end
  end
end
