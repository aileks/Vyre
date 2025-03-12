defmodule ApiWeb.ServerMemberControllerTest do
  use ApiWeb.ConnCase

  import Api.ServersFixtures

  alias Api.Servers.ServerMember

  @create_attrs %{
    role: "some role",
    joined_at: ~U[2025-03-11 15:37:00Z]
  }
  @update_attrs %{
    role: "some updated role",
    joined_at: ~U[2025-03-12 15:37:00Z]
  }
  @invalid_attrs %{role: nil, joined_at: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all server_members", %{conn: conn} do
      conn = get(conn, ~p"/api/server_members")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create server_member" do
    test "renders server_member when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/server_members", server_member: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/server_members/#{id}")

      assert %{
               "id" => ^id,
               "joined_at" => "2025-03-11T15:37:00Z",
               "role" => "some role"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/server_members", server_member: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update server_member" do
    setup [:create_server_member]

    test "renders server_member when data is valid", %{conn: conn, server_member: %ServerMember{id: id} = server_member} do
      conn = put(conn, ~p"/api/server_members/#{server_member}", server_member: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/server_members/#{id}")

      assert %{
               "id" => ^id,
               "joined_at" => "2025-03-12T15:37:00Z",
               "role" => "some updated role"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, server_member: server_member} do
      conn = put(conn, ~p"/api/server_members/#{server_member}", server_member: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete server_member" do
    setup [:create_server_member]

    test "deletes chosen server_member", %{conn: conn, server_member: server_member} do
      conn = delete(conn, ~p"/api/server_members/#{server_member}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/server_members/#{server_member}")
      end
    end
  end

  defp create_server_member(_) do
    server_member = server_member_fixture()
    %{server_member: server_member}
  end
end
