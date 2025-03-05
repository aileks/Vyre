defmodule Api.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Api.Accounts` context.
  """

  def unique_user_email, do: "user-#{System.unique_integer([:positive])}@example.com"
  def unique_user_username, do: "user_#{System.unique_integer([:positive])}"

  def valid_user_attributes(attrs \\ %{}) do
    Enum.into(attrs, %{
      email: unique_user_email(),
      username: unique_user_username(),
      password: "Password123",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      status: "active"
    })
  end

  def user_fixture(attrs \\ %{}) do
    attrs = valid_user_attributes(attrs)

    {:ok, user} = Api.Accounts.register_user(attrs)
    user
  end
end
