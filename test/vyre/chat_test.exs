defmodule Vyre.ChatTest do
  use Vyre.DataCase

  alias Vyre.Chat

  describe "messages" do
    alias Vyre.Chat.Message

    import Vyre.ChatFixtures

    @invalid_attrs %{index: nil, show: nil}

    test "list_messages/0 returns all messages" do
      message = message_fixture()
      assert Chat.list_messages() == [message]
    end

    test "get_message!/1 returns the message with given id" do
      message = message_fixture()
      assert Chat.get_message!(message.id) == message
    end

    test "create_message/1 with valid data creates a message" do
      valid_attrs = %{index: "some index", show: "some show"}

      assert {:ok, %Message{} = message} = Chat.create_message(valid_attrs)
      assert message.index == "some index"
      assert message.show == "some show"
    end

    test "create_message/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Chat.create_message(@invalid_attrs)
    end

    test "update_message/2 with valid data updates the message" do
      message = message_fixture()
      update_attrs = %{index: "some updated index", show: "some updated show"}

      assert {:ok, %Message{} = message} = Chat.update_message(message, update_attrs)
      assert message.index == "some updated index"
      assert message.show == "some updated show"
    end

    test "update_message/2 with invalid data returns error changeset" do
      message = message_fixture()
      assert {:error, %Ecto.Changeset{}} = Chat.update_message(message, @invalid_attrs)
      assert message == Chat.get_message!(message.id)
    end

    test "delete_message/1 deletes the message" do
      message = message_fixture()
      assert {:ok, %Message{}} = Chat.delete_message(message)
      assert_raise Ecto.NoResultsError, fn -> Chat.get_message!(message.id) end
    end

    test "change_message/1 returns a message changeset" do
      message = message_fixture()
      assert %Ecto.Changeset{} = Chat.change_message(message)
    end
  end
end
