defmodule Api.ServersFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Api.Servers` context.
  """

  @doc """
  Generate a unique server name.
  """
  def unique_server_name, do: "some name#{System.unique_integer([:positive])}"

  @doc """
  Generate a server.
  """
  def server_fixture(attrs \\ %{}) do
    {:ok, server} =
      attrs
      |> Enum.into(%{
        created_at: ~U[2025-03-11 14:32:00Z],
        description: "some description",
        icon_url: "some icon_url",
        name: unique_server_name()
      })
      |> Api.Servers.create_server()

    server
  end

  @doc """
  Generate a server_member.
  """
  def server_member_fixture(attrs \\ %{}) do
    {:ok, server_member} =
      attrs
      |> Enum.into(%{
        joined_at: ~U[2025-03-11 15:37:00Z],
        role: "some role"
      })
      |> Api.Servers.create_server_member()

    server_member
  end
end
