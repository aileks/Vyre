defmodule ApiWeb.ChannelController do
  use ApiWeb, :controller

  alias Api.Channels
  alias Api.Channels.Channel

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    channels = Channels.list_channels()
    render(conn, :index, channels: channels)
  end

  def create(conn, %{"channel" => channel_params}) do
    with {:ok, %Channel{} = channel} <- Channels.create_channel(channel_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/channels/#{channel}")
      |> render(:show, channel: channel)
    end
  end

  def show(conn, %{"id" => id}) do
    channel = Channels.get_channel!(id)
    render(conn, :show, channel: channel)
  end

  def update(conn, %{"id" => id, "channel" => channel_params}) do
    channel = Channels.get_channel!(id)

    with {:ok, %Channel{} = channel} <- Channels.update_channel(channel, channel_params) do
      render(conn, :show, channel: channel)
    end
  end

  def delete(conn, %{"id" => id}) do
    channel = Channels.get_channel!(id)

    with {:ok, %Channel{}} <- Channels.delete_channel(channel) do
      send_resp(conn, :no_content, "")
    end
  end
end
