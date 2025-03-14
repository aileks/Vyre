defmodule Api.RolesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Api.Roles` context.
  """

  @doc """
  Generate a role.
  """
  def role_fixture(attrs \\ %{}) do
    {:ok, role} =
      attrs
      |> Enum.into(%{
        color: "some color",
        hoist: true,
        mentionable: true,
        name: "some name",
        permissions: 42,
        position: 42
      })
      |> Api.Roles.create_role()

    role
  end

  @doc """
  Generate a user_role.
  """
  def user_role_fixture(attrs \\ %{}) do
    {:ok, user_role} =
      attrs
      |> Enum.into(%{

      })
      |> Api.Roles.create_user_role()

    user_role
  end
end
