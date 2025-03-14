defmodule ApiWeb.FriendController do
  use ApiWeb, :controller

  alias Api.Friends
  alias Api.Friends.Friend

  action_fallback(ApiWeb.FallbackController)

  def index(conn, _params) do
    friends = Friends.get_friends(conn.assigns.current_user.id)
    render(conn, "friend.json", friends: friends)
  end

  def create(conn, %{"friend" => friend_params}) do
    with {:ok, %Friend{} = friend} <- Friends.create_friend(friend_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/friends/#{friend.id}")
      |> render("friend.json", friend: friend)
    end
  end

  def show(conn, %{"id" => id}) do
    friend = Friends.get_friend!(id)
    render(conn, "friend.json", friend: friend)
  end

  def update(conn, %{"id" => id, "friend" => friend_params}) do
    friend = Friends.get_friend!(id)

    with {:ok, %Friend{} = updated_friend} <- Friends.update_friend(friend, friend_params) do
      render(conn, "friend.json", friend: updated_friend)
    end
  end

  def delete(conn, %{"id" => id}) do
    friend = Friends.get_friend!(id)

    with {:ok, %Friend{}} <- Friends.delete_friend(friend) do
      send_resp(conn, :no_content, "")
    end
  end

  # ---------------------------------------------- #
  #          Friend Request Service Logic          #
  # ---------------------------------------------- #

  def send_request(conn, %{"friend_id" => friend_id}) do
    user_id = conn.assigns.current_user.id

    with {:ok, %Friend{} = friend_request} <- Friends.send_friend_request(user_id, friend_id) do
      render(conn, "friend.json", friend: friend_request)
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  def accept_request(conn, %{"friend_id" => friend_id}) do
    user_id = conn.assigns.current_user.id

    with {:ok, %Friend{} = friendship} <- Friends.accept_friend_request(user_id, friend_id) do
      render(conn, "friend.json", friend: friendship)
    else
      {:error, reason} -> {:error, reason}
    end
  end

  def decline_request(conn, %{"friend_id" => friend_id}) do
    user_id = conn.assigns.current_user.id

    with {:ok, _} <- Friends.decline_friend_request(user_id, friend_id) do
      send_resp(conn, :no_content, "")
    else
      {:error, reason} -> {:error, reason}
    end
  end

  def list_friends(conn, _params) do
    friends = Friends.get_friends(conn.assigns.current_user.id)
    render(conn, "friend.json", friends: friends)
  end

  def list_pending_requests(conn, _params) do
    requests = Friends.get_pending_friend_requests(conn.assigns.current_user.id)
    render(conn, "friend_requests.json", requests: requests)
  end
end
