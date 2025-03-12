defmodule ApiWeb.FriendController do
  use ApiWeb, :controller

  alias Api.Friends
  alias Api.Friends.Friend

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    friends = Friends.list_friends()
    render(conn, :index, friends: friends)
  end

  def create(conn, %{"friend" => friend_params}) do
    with {:ok, %Friend{} = friend} <- Friends.create_friend(friend_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/friends/#{friend}")
      |> render(:show, friend: friend)
    end
  end

  def show(conn, %{"id" => id}) do
    friend = Friends.get_friend!(id)
    render(conn, :show, friend: friend)
  end

  def update(conn, %{"id" => id, "friend" => friend_params}) do
    friend = Friends.get_friend!(id)

    with {:ok, %Friend{} = friend} <- Friends.update_friend(friend, friend_params) do
      render(conn, :show, friend: friend)
    end
  end

  def delete(conn, %{"id" => id}) do
    friend = Friends.get_friend!(id)

    with {:ok, %Friend{}} <- Friends.delete_friend(friend) do
      send_resp(conn, :no_content, "")
    end
  end
end
