defmodule ApiWeb.AuthJSON do
  def user(%{user: user}) do
    %{
      user: %{
        id: user.id,
        status: user.status,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url
      }
    }
  end

  def user_with_token_info(
        %{
          user: user,
          expires_at: expiry,
          refresh_expires_at: refresh_expires_at
        } = _params
      ) do
    %{
      user: %{
        id: user.id,
        status: user.status,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url
      },
      expiresAt: expiry,
      refreshExpiresAt: refresh_expires_at
    }
  end
end
