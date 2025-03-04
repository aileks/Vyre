defmodule Api.Accounts.Guardian do
  use Guardian, otp_app: :api

  alias Api.Accounts

  def subject_for_token(user, _claims) do
    {:ok, to_string(user.id)}
  end

  def resource_from_claims(%{"sub" => id}) do
    {:ok, Api.Accounts.get_user!(id)}
  rescue
    Ecto.NoResultsError -> {:error, :resource_not_found}
  end
end
