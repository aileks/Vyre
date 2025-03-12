defmodule ApiWeb.FriendJSON do
  alias Api.Friends.Friend

  @doc """
  Renders a list of friends.
  """
  def index(%{friends: friends}) do
    %{data: for(friend <- friends, do: data(friend))}
  end

  @doc """
  Renders a single friend.
  """
  def show(%{friend: friend}) do
    %{friend: data(friend)}
  end

  @doc """
  Renders a list of pending friend requests.
  """
  def friend_requests(%{requests: requests}) do
    %{friend_requests: for(request <- requests, do: data(request))}
  end

  defp data(%Friend{} = friend) do
    %{
      id: friend.id,
      user_id: friend.user_id,
      friend_id: friend.friend_id,
      status: friend.status,
      friends_since: friend.inserted_at
    }
  end
end
