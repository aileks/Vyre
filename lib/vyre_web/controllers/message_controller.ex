defmodule VyreWeb.MessageController do
  use VyreWeb, :controller

  alias Vyre.Chat
  alias Vyre.Chat.Message

  # Get all messages
  def index(conn, _params) do
    messages = Chat.list_messages()
    json(conn, %{data: messages})
  end

  # Create a message
  def create(conn, %{"message" => message_params}) do
    case Chat.create_message(message_params) do
      {:ok, message} ->
        conn
        |> put_status(:created)
        |> json(%{data: message, message: "Message created successfully"})

      {:error, %Ecto.Changeset{} = changeset} ->
        errors = format_changeset_errors(changeset)
        
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: errors})
    end
  end

  # Get a specific message
  def show(conn, %{"id" => id}) do
    message = Chat.get_message!(id)
    json(conn, %{data: message})
  end

  # Update a message
  def update(conn, %{"id" => id, "message" => message_params}) do
    message = Chat.get_message!(id)

    case Chat.update_message(message, message_params) do
      {:ok, message} ->
        json(conn, %{data: message, message: "Message updated successfully"})

      {:error, %Ecto.Changeset{} = changeset} ->
        errors = format_changeset_errors(changeset)
        
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: errors})
    end
  end

  # Delete a message
  def delete(conn, %{"id" => id}) do
    message = Chat.get_message!(id)
    {:ok, _message} = Chat.delete_message(message)

    json(conn, %{message: "Message deleted successfully"})
  end

  # Helper function to format changeset errors
  defp format_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end

