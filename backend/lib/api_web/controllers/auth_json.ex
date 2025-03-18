defmodule ApiWeb.AuthJSON do
  def me(%{user: user}) do
    %{
      user: %{
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url
      }
    }
  end
end
