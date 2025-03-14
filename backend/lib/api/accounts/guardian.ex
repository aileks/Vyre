defmodule Api.Accounts.Guardian do
  use Guardian, otp_app: :api

  alias Api.Accounts, as: Accounts

  def subject_for_token(%Accounts.User{} = user, _claims) do
    sub = to_string(user.id)
    {:ok, sub}
  end

  def subject_for_token(_resource, _claims) do
    {:error, :unknown_resource}
  end

  def resource_from_claims(%{"sub" => id}) do
    case Accounts.get_user(id) do
      {:ok, resource} -> {:ok, resource}
      {:error, _reason} -> {:error, :resource_not_found}
    end
  end

  def create_token(user, remember_me \\ false) do
    ttl = if remember_me, do: {30, :days}, else: {1, :hour}
    {:ok, token, claims} = encode_and_sign(user, %{}, ttl: ttl)
    exp = claims["exp"]
    {token, exp}
  end

  def create_refresh_token(user, _claims \\ %{}) do
    {:ok, token, _claims} = encode_and_sign(user, %{type: "refresh"}, ttl: {30, :days})
    token
  end

  def get_resource_from_token(token) do
    case decode_and_verify(token) do
      {:ok, claims} -> resource_from_claims(claims)
      error -> error
    end
  end
end
