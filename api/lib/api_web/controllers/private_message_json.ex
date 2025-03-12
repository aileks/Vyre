defmodule ApiWeb.PrivateMessageJSON do
  alias Api.Messages.PrivateMessage

  @doc """
  Renders a list of private_messages.
  """
  def index(%{private_messages: private_messages}) do
    %{data: for(private_message <- private_messages, do: data(private_message))}
  end

  @doc """
  Renders a single private_message.
  """
  def show(%{private_message: private_message}) do
    %{data: data(private_message)}
  end

  defp data(%PrivateMessage{} = private_message) do
    %{
      id: private_message.id,
      content: private_message.content,
      timestamp: private_message.timestamp,
      read: private_message.read
    }
  end
end
