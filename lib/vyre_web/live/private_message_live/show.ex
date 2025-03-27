defmodule VyreWeb.PrivateMessageLive.Show do
  use VyreWeb, :live_view

  alias Vyre.Messages

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def handle_params(%{"id" => id}, _, socket) do
    {:noreply,
     socket
     |> assign(:page_title, page_title(socket.assigns.live_action))
     |> assign(:private_message, Messages.get_private_message!(id))}
  end

  defp page_title(:show), do: "Show Private message"
  defp page_title(:edit), do: "Edit Private message"
end
