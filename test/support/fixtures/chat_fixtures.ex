defmodule Vyre.ChatFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Vyre.Chat` context.
  """

  @doc """
  Generate a message.
  """
  def message_fixture(attrs \\ %{}) do
    {:ok, message} =
      attrs
      |> Enum.into(%{
        index: "some index",
        show: "some show"
      })
      |> Vyre.Chat.create_message()

    message
  end
end
