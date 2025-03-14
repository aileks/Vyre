defmodule ApiWeb.PrivateMessageControllerTest do
  use ApiWeb.ConnCase

  import Api.MessagesFixtures

  alias Api.Messages.PrivateMessage

  @create_attrs %{
    timestamp: ~U[2025-03-11 15:19:00Z],
    read: true,
    content: "some content"
  }
  @update_attrs %{
    timestamp: ~U[2025-03-12 15:19:00Z],
    read: false,
    content: "some updated content"
  }
  @invalid_attrs %{timestamp: nil, read: nil, content: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all private_messages", %{conn: conn} do
      conn = get(conn, ~p"/api/private_messages")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create private_message" do
    test "renders private_message when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/private_messages", private_message: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/private_messages/#{id}")

      assert %{
               "id" => ^id,
               "content" => "some content",
               "read" => true,
               "timestamp" => "2025-03-11T15:19:00Z"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/private_messages", private_message: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update private_message" do
    setup [:create_private_message]

    test "renders private_message when data is valid", %{conn: conn, private_message: %PrivateMessage{id: id} = private_message} do
      conn = put(conn, ~p"/api/private_messages/#{private_message}", private_message: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/private_messages/#{id}")

      assert %{
               "id" => ^id,
               "content" => "some updated content",
               "read" => false,
               "timestamp" => "2025-03-12T15:19:00Z"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, private_message: private_message} do
      conn = put(conn, ~p"/api/private_messages/#{private_message}", private_message: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete private_message" do
    setup [:create_private_message]

    test "deletes chosen private_message", %{conn: conn, private_message: private_message} do
      conn = delete(conn, ~p"/api/private_messages/#{private_message}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/private_messages/#{private_message}")
      end
    end
  end

  defp create_private_message(_) do
    private_message = private_message_fixture()
    %{private_message: private_message}
  end
end
