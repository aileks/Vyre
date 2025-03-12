defmodule ApiWeb.AuthJSON do
  def user(%{user: user}) do
    %{
      user: %{
        id: user.id,
        status: user.status,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url
      }
    }
  end

  def user_with_token(%{user: user, token: {token_string, expiry}, conn: _conn}) do
    %{
      user: %{
        id: user.id,
        status: user.status,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url
      },
      token: token_string,
      expires_at: expiry
    }
  end
end
