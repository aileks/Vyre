defmodule ApiWeb.FriendControllerTest do
  use ApiWeb.ConnCase

  import Api.FriendsFixtures

  alias Api.Friends.Friend

  @create_attrs %{

  }
  @update_attrs %{

  }
  @invalid_attrs %{}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all friends", %{conn: conn} do
      conn = get(conn, ~p"/api/friends")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create friend" do
    test "renders friend when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/friends", friend: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/friends/#{id}")

      assert %{
               "id" => ^id
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/friends", friend: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update friend" do
    setup [:create_friend]

    test "renders friend when data is valid", %{conn: conn, friend: %Friend{id: id} = friend} do
      conn = put(conn, ~p"/api/friends/#{friend}", friend: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/friends/#{id}")

      assert %{
               "id" => ^id
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, friend: friend} do
      conn = put(conn, ~p"/api/friends/#{friend}", friend: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete friend" do
    setup [:create_friend]

    test "deletes chosen friend", %{conn: conn, friend: friend} do
      conn = delete(conn, ~p"/api/friends/#{friend}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/friends/#{friend}")
      end
    end
  end

  defp create_friend(_) do
    friend = friend_fixture()
    %{friend: friend}
  end
end
