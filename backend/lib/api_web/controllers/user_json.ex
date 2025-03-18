defmodule ApiWeb.UserJSON do
  alias Api.Accounts.User

  @doc """
  Renders a list of users.
  """
  def index(%{users: users}) do
    %{data: for(user <- users, do: data(user))}
  end

  @doc """
  Renders a single user.
  """
  def show(%{user: user}) do
    %{user: data(user)}
  end

  def show_with_token(%{user: user, token: token}) do
    %{user: data(user), token: token}
  end

  defp data(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      avatar_url: user.avatar_url,
      status: user.status
      # friendships: user.friendships,
      # friend_requests: user.friend_requests
    }
  end
end
