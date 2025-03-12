defmodule ApiWeb.ServerJSON do
  alias Api.Servers.Server

  @doc """
  Renders a list of servers.
  """
  def index(%{servers: servers}) do
    %{data: for(server <- servers, do: data(server))}
  end

  @doc """
  Renders a single server.
  """
  def show(%{server: server}) do
    %{data: data(server)}
  end

  defp data(%Server{} = server) do
    %{
      id: server.id,
      name: server.name,
      description: server.description,
      icon_url: server.icon_url,
      created_at: server.created_at
    }
  end
end
