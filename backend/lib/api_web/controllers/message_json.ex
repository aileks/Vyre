defmodule ApiWeb.MessageJSON do
  alias Api.Messages.Message

  @doc """
  Renders a list of messages.
  """
  def index(%{messages: messages}) do
    %{messages: for(message <- messages, do: data(message))}
  end

  @doc """
  Renders a single message.
  """
  def show(%{message: message}) do
    %{message: data(message)}
  end

  defp data(%Message{} = message) do
    %{
      id: message.id,
      content: message.content,
      timestamp: message.inserted_at,
      edited: message.edited,
      mentions_everyone: message.mentions_everyone
    }
  end
end
