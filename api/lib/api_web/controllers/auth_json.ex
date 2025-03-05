defmodule ApiWeb.AuthJSON do
  alias Api.Accounts.User

  def user(%{user: user}) do
    %{
      user: user_data(user)
    }
  end

  def user_with_token(%{user: user, token: token}) do
    %{
      user: user_data(user),
      token: token
    }
  end

  defp user_data(%User{} = user) do
    %{
      id: user.id,
      email: user.email,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    }
  end
end
