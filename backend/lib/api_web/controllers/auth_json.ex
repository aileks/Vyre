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

  def user_with_token(
        %{
          user: user,
          token: token,
          expiry: expiry,
          refresh_token: refresh_token,
          refresh_expires_at: refresh_expires_at
        } = _params
      ) do
    %{
      user: %{
        id: user.id,
        status: user.status,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url
      },
      token: token,
      expires_at: expiry,
      refresh_token: refresh_token,
      refresh_expires_at: refresh_expires_at
    }
  end

  def refresh_token(%{
        token: token,
        expires_at: expires_at,
        refresh_token: refresh_token,
        refresh_expires_at: refresh_expires_at
      }) do
    %{
      token: token,
      refresh_token: refresh_token,
      refresh_expires_at: refresh_expires_at,
      expires_at: expires_at
    }
  end
end
