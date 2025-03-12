defmodule Api.MessagesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Api.Messages` context.
  """

  @doc """
  Generate a message.
  """
  def message_fixture(attrs \\ %{}) do
    {:ok, message} =
      attrs
      |> Enum.into(%{
        content: "some content",
        edited: true,
        mentions_everyone: true,
        timestamp: ~U[2025-03-11 15:15:00Z]
      })
      |> Api.Messages.create_message()

    message
  end

  @doc """
  Generate a private_message.
  """
  def private_message_fixture(attrs \\ %{}) do
    {:ok, private_message} =
      attrs
      |> Enum.into(%{
        content: "some content",
        read: true,
        timestamp: ~U[2025-03-11 15:19:00Z]
      })
      |> Api.Messages.create_private_message()

    private_message
  end
end
