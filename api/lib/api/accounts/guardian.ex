defmodule Api.Accounts.Guardian do
  use Guardian, otp_app: :api

  def subject_for_token(user, _claims) do
    {:ok, to_string(user.id)}
  end

  def resource_from_claims(%{"sub" => id}) do
    case Api.Accounts.get_user(id) do
      {:ok, user} -> {:ok, user}
      {:error, _reason} -> {:error, :resource_not_found}
    end
  end
end
