defmodule ApiWeb.MessageControllerTest do
  use ApiWeb.ConnCase

  import Api.MessagesFixtures

  alias Api.Messages.Message

  @create_attrs %{
    timestamp: ~U[2025-03-11 15:15:00Z],
    content: "some content",
    edited: true,
    mentions_everyone: true
  }
  @update_attrs %{
    timestamp: ~U[2025-03-12 15:15:00Z],
    content: "some updated content",
    edited: false,
    mentions_everyone: false
  }
  @invalid_attrs %{timestamp: nil, content: nil, edited: nil, mentions_everyone: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all messages", %{conn: conn} do
      conn = get(conn, ~p"/api/messages")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create message" do
    test "renders message when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/messages", message: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/messages/#{id}")

      assert %{
               "id" => ^id,
               "content" => "some content",
               "edited" => true,
               "mentions_everyone" => true,
               "timestamp" => "2025-03-11T15:15:00Z"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/messages", message: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update message" do
    setup [:create_message]

    test "renders message when data is valid", %{conn: conn, message: %Message{id: id} = message} do
      conn = put(conn, ~p"/api/messages/#{message}", message: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/messages/#{id}")

      assert %{
               "id" => ^id,
               "content" => "some updated content",
               "edited" => false,
               "mentions_everyone" => false,
               "timestamp" => "2025-03-12T15:15:00Z"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, message: message} do
      conn = put(conn, ~p"/api/messages/#{message}", message: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete message" do
    setup [:create_message]

    test "deletes chosen message", %{conn: conn, message: message} do
      conn = delete(conn, ~p"/api/messages/#{message}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/messages/#{message}")
      end
    end
  end

  defp create_message(_) do
    message = message_fixture()
    %{message: message}
  end
end
