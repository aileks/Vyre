defmodule Api.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Api.Accounts` context.
  """

  def unique_user_email, do: "user-#{System.unique_integer([:positive])}@example.com"
  def unique_user_username, do: "user_#{System.unique_integer([:positive])}"

  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        email: unique_user_email(),
        username: unique_user_username(),
        password: "Password123",
        display_name: "Test User",
        avatar_url: "https://example.com/avatar.jpg"
      })
      |> Api.Accounts.register_user()

    user
  end
end
