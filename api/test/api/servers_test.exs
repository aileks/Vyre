defmodule Api.ServersTest do
  use Api.DataCase

  alias Api.Servers

  describe "servers" do
    alias Api.Servers.Server

    import Api.ServersFixtures

    @invalid_attrs %{name: nil, description: nil, icon_url: nil, created_at: nil}

    test "list_servers/0 returns all servers" do
      server = server_fixture()
      assert Servers.list_servers() == [server]
    end

    test "get_server!/1 returns the server with given id" do
      server = server_fixture()
      assert Servers.get_server!(server.id) == server
    end

    test "create_server/1 with valid data creates a server" do
      valid_attrs = %{name: "some name", description: "some description", icon_url: "some icon_url", created_at: ~U[2025-03-11 14:32:00Z]}

      assert {:ok, %Server{} = server} = Servers.create_server(valid_attrs)
      assert server.name == "some name"
      assert server.description == "some description"
      assert server.icon_url == "some icon_url"
      assert server.created_at == ~U[2025-03-11 14:32:00Z]
    end

    test "create_server/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Servers.create_server(@invalid_attrs)
    end

    test "update_server/2 with valid data updates the server" do
      server = server_fixture()
      update_attrs = %{name: "some updated name", description: "some updated description", icon_url: "some updated icon_url", created_at: ~U[2025-03-12 14:32:00Z]}

      assert {:ok, %Server{} = server} = Servers.update_server(server, update_attrs)
      assert server.name == "some updated name"
      assert server.description == "some updated description"
      assert server.icon_url == "some updated icon_url"
      assert server.created_at == ~U[2025-03-12 14:32:00Z]
    end

    test "update_server/2 with invalid data returns error changeset" do
      server = server_fixture()
      assert {:error, %Ecto.Changeset{}} = Servers.update_server(server, @invalid_attrs)
      assert server == Servers.get_server!(server.id)
    end

    test "delete_server/1 deletes the server" do
      server = server_fixture()
      assert {:ok, %Server{}} = Servers.delete_server(server)
      assert_raise Ecto.NoResultsError, fn -> Servers.get_server!(server.id) end
    end

    test "change_server/1 returns a server changeset" do
      server = server_fixture()
      assert %Ecto.Changeset{} = Servers.change_server(server)
    end
  end

  describe "server_members" do
    alias Api.Servers.ServerMember

    import Api.ServersFixtures

    @invalid_attrs %{role: nil, joined_at: nil}

    test "list_server_members/0 returns all server_members" do
      server_member = server_member_fixture()
      assert Servers.list_server_members() == [server_member]
    end

    test "get_server_member!/1 returns the server_member with given id" do
      server_member = server_member_fixture()
      assert Servers.get_server_member!(server_member.id) == server_member
    end

    test "create_server_member/1 with valid data creates a server_member" do
      valid_attrs = %{role: "some role", joined_at: ~U[2025-03-11 15:37:00Z]}

      assert {:ok, %ServerMember{} = server_member} = Servers.create_server_member(valid_attrs)
      assert server_member.role == "some role"
      assert server_member.joined_at == ~U[2025-03-11 15:37:00Z]
    end

    test "create_server_member/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Servers.create_server_member(@invalid_attrs)
    end

    test "update_server_member/2 with valid data updates the server_member" do
      server_member = server_member_fixture()
      update_attrs = %{role: "some updated role", joined_at: ~U[2025-03-12 15:37:00Z]}

      assert {:ok, %ServerMember{} = server_member} = Servers.update_server_member(server_member, update_attrs)
      assert server_member.role == "some updated role"
      assert server_member.joined_at == ~U[2025-03-12 15:37:00Z]
    end

    test "update_server_member/2 with invalid data returns error changeset" do
      server_member = server_member_fixture()
      assert {:error, %Ecto.Changeset{}} = Servers.update_server_member(server_member, @invalid_attrs)
      assert server_member == Servers.get_server_member!(server_member.id)
    end

    test "delete_server_member/1 deletes the server_member" do
      server_member = server_member_fixture()
      assert {:ok, %ServerMember{}} = Servers.delete_server_member(server_member)
      assert_raise Ecto.NoResultsError, fn -> Servers.get_server_member!(server_member.id) end
    end

    test "change_server_member/1 returns a server_member changeset" do
      server_member = server_member_fixture()
      assert %Ecto.Changeset{} = Servers.change_server_member(server_member)
    end
  end
end
