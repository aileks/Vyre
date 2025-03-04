defmodule ApiWeb.AuthJSON do
  @doc """
  Renders a user
  """
  def user(%{user: user, token: token}) do
    %{
      data: data(user),
      token: token
    }
  end

  def user(%{user: user}) do
    %{data: data(user)}
  end

  defp data(user) do
    %{
      id: user.id,
      email: user.email,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      status: user.status
    }
  end
end
