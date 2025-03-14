defmodule Api.ChannelsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Api.Channels` context.
  """

  @doc """
  Generate a channel.
  """
  def channel_fixture(attrs \\ %{}) do
    {:ok, channel} =
      attrs
      |> Enum.into(%{
        description: "some description",
        name: "some name",
        topic: "some topic",
        type: "some type"
      })
      |> Api.Channels.create_channel()

    channel
  end
end
