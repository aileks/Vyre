defmodule ApiWeb.PrivateMessageController do
  use ApiWeb, :controller

  alias Api.Messages
  alias Api.Messages.PrivateMessage

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    private_messages = Messages.list_private_messages()
    render(conn, :index, private_messages: private_messages)
  end

  def create(conn, %{"private_message" => private_message_params}) do
    with {:ok, %PrivateMessage{} = private_message} <- Messages.create_private_message(private_message_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/private_messages/#{private_message}")
      |> render(:show, private_message: private_message)
    end
  end

  def show(conn, %{"id" => id}) do
    private_message = Messages.get_private_message!(id)
    render(conn, :show, private_message: private_message)
  end

  def update(conn, %{"id" => id, "private_message" => private_message_params}) do
    private_message = Messages.get_private_message!(id)

    with {:ok, %PrivateMessage{} = private_message} <- Messages.update_private_message(private_message, private_message_params) do
      render(conn, :show, private_message: private_message)
    end
  end

  def delete(conn, %{"id" => id}) do
    private_message = Messages.get_private_message!(id)

    with {:ok, %PrivateMessage{}} <- Messages.delete_private_message(private_message) do
      send_resp(conn, :no_content, "")
    end
  end
end
