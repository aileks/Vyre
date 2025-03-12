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
    %{data: data(friend)}
  end

  defp data(%Friend{} = friend) do
    %{
      id: friend.id
    }
  end
end
