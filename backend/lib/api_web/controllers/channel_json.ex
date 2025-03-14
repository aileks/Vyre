defmodule ApiWeb.ChannelJSON do
  alias Api.Channels.Channel

  @doc """
  Renders a list of channels.
  """
  def index(%{channels: channels}) do
    %{data: for(channel <- channels, do: data(channel))}
  end

  @doc """
  Renders a single channel.
  """
  def show(%{channel: channel}) do
    %{data: data(channel)}
  end

  defp data(%Channel{} = channel) do
    %{
      id: channel.id,
      name: channel.name,
      description: channel.description,
      topic: channel.topic,
      type: channel.type
    }
  end
end
