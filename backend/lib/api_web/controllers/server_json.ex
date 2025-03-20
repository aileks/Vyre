defmodule ApiWeb.ServerJSON do
  alias Api.Servers.Server

  @doc """
  Renders a list of servers.
  """
  def index(%{servers: servers}) do
    %{servers: for(server <- servers, do: data(server))}
  end

  @doc """
  Renders a single server.
  """
  def show(%{server: server}) do
    %{server: data(server)}
  end

  defp data(%Server{} = server) do
    %{
      id: server.id,
      name: server.name,
      description: server.description,
      icon_url: server.icon_url,
      owner_id: server.owner_id,
      created_at: server.inserted_at
    }
  end
end
