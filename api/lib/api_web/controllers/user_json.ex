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
    %{data: data(user)}
  end

  defp data(%User{} = user) do
    %{
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      password: user.password,
      avatar_url: user.avatar_url,
      status: user.status
    }
  end
end
