defmodule VyreWeb.MessageControllerTest do
  use VyreWeb.ConnCase

  import Vyre.ChatFixtures

  @create_attrs %{index: "some index", show: "some show"}
  @update_attrs %{index: "some updated index", show: "some updated show"}
  @invalid_attrs %{index: nil, show: nil}

  describe "index" do
    test "lists all messages", %{conn: conn} do
      conn = get(conn, ~p"/messages")
      assert html_response(conn, 200) =~ "Listing Messages"
    end
  end

  describe "new message" do
    test "renders form", %{conn: conn} do
      conn = get(conn, ~p"/messages/new")
      assert html_response(conn, 200) =~ "New Message"
    end
  end

  describe "create message" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/messages", message: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == ~p"/messages/#{id}"

      conn = get(conn, ~p"/messages/#{id}")
      assert html_response(conn, 200) =~ "Message #{id}"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/messages", message: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Message"
    end
  end

  describe "edit message" do
    setup [:create_message]

    test "renders form for editing chosen message", %{conn: conn, message: message} do
      conn = get(conn, ~p"/messages/#{message}/edit")
      assert html_response(conn, 200) =~ "Edit Message"
    end
  end

  describe "update message" do
    setup [:create_message]

    test "redirects when data is valid", %{conn: conn, message: message} do
      conn = put(conn, ~p"/messages/#{message}", message: @update_attrs)
      assert redirected_to(conn) == ~p"/messages/#{message}"

      conn = get(conn, ~p"/messages/#{message}")
      assert html_response(conn, 200) =~ "some updated index"
    end

    test "renders errors when data is invalid", %{conn: conn, message: message} do
      conn = put(conn, ~p"/messages/#{message}", message: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Message"
    end
  end

  describe "delete message" do
    setup [:create_message]

    test "deletes chosen message", %{conn: conn, message: message} do
      conn = delete(conn, ~p"/messages/#{message}")
      assert redirected_to(conn) == ~p"/messages"

      assert_error_sent 404, fn ->
        get(conn, ~p"/messages/#{message}")
      end
    end
  end

  defp create_message(_) do
    message = message_fixture()
    %{message: message}
  end
end
