defmodule ApiWeb.FriendController do
  use ApiWeb, :controller

  alias Api.Friends
  alias Api.Friends.Friend

  action_fallback(ApiWeb.FallbackController)

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

  # ---------------------------------------------- #
  #          Friend Request Service Logic          #
  # ---------------------------------------------- #

  def send_request(conn, %{"friend_id" => friend_id}) do
    case Friends.send_friend_request(conn.assigns.current_user.id, friend_id) do
      {:ok, _friend_request} -> json(conn, %{message: "Friend request sent"})
      {:error, error} -> json(conn, %{error: error}, 400)
    end
  end

  def accept_request(conn, %{"friend_id" => friend_id}) do
    case Friends.accept_friend_request(conn.assigns.current_user.id, friend_id) do
      {:ok, _friendship} -> json(conn, %{message: "Friend request accepted"})
      {:error, error} -> json(conn, %{error: error}, 400)
    end
  end

  def decline_request(conn, %{"friend_id" => friend_id}) do
    case Friends.decline_friend_request(conn.assigns.current_user.id, friend_id) do
      {:ok, _} -> json(conn, %{message: "Friend request declined"})
      {:error, error} -> json(conn, %{error: error}, 400)
    end
  end

  def list_friends(conn, _params) do
    friends = Friends.get_friends(conn.assigns.current_user.id)
    json(conn, friends)
  end

  def list_pending_requests(conn, _params) do
    requests = Friends.get_pending_friend_requests(conn.assigns.current_user.id)
    json(conn, requests)
  end
end
