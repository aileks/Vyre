defmodule ApiWeb.ServerControllerTest do
  use ApiWeb.ConnCase

  import Api.ServersFixtures

  alias Api.Servers.Server

  @create_attrs %{
    name: "some name",
    description: "some description",
    icon_url: "some icon_url"
  }
  @update_attrs %{
    name: "some updated name",
    description: "some updated description",
    icon_url: "some updated icon_url"
  }
  @invalid_attrs %{name: nil, description: nil, icon_url: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all servers", %{conn: conn} do
      conn = get(conn, ~p"/api/servers")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create server" do
    test "renders server when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/servers", server: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/servers/#{id}")

      assert %{
               "id" => ^id,
               "created_at" => "2025-03-11T14:32:00Z",
               "description" => "some description",
               "icon_url" => "some icon_url",
               "name" => "some name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/servers", server: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update server" do
    setup [:create_server]

    test "renders server when data is valid", %{conn: conn, server: %Server{id: id} = server} do
      conn = put(conn, ~p"/api/servers/#{server}", server: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/servers/#{id}")

      assert %{
               "id" => ^id,
               "created_at" => "2025-03-12T14:32:00Z",
               "description" => "some updated description",
               "icon_url" => "some updated icon_url",
               "name" => "some updated name"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, server: server} do
      conn = put(conn, ~p"/api/servers/#{server}", server: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete server" do
    setup [:create_server]

    test "deletes chosen server", %{conn: conn, server: server} do
      conn = delete(conn, ~p"/api/servers/#{server}")
      assert response(conn, 204)

      assert_error_sent(404, fn ->
        get(conn, ~p"/api/servers/#{server}")
      end)
    end
  end

  defp create_server(_) do
    server = server_fixture()
    %{server: server}
  end
end
