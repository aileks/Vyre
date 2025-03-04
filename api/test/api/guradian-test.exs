defmodule Api.GuardianTest do
  use Api.DataCase, async: true

  alias Api.Accounts
  alias Api.Accounts.Guardian
  alias Api.Accounts.User

  @valid_attrs %{
    email: "user@example.com",
    password: "supersecretpassword",
    username: "testuser",
    display_name: "Test User"
  }

  setup do
    {:ok, user} = Accounts.create_user(@valid_attrs)
    %{user: user}
  end

  describe "Guardian" do
    test "encode_and_sign/1 creates token for user", %{user: user} do
      {:ok, token, claims} = Guardian.encode_and_sign(user)

      assert is_binary(token)
      assert claims["sub"] == to_string(user.id)
    end

    test "subject_for_token/2 returns user id as string", %{user: user} do
      {:ok, subject} = Guardian.subject_for_token(user, %{})
      assert subject == to_string(user.id)
    end

    test "resource_from_claims/1 returns user from valid claims", %{user: user} do
      {:ok, retrieved_user} = Guardian.resource_from_claims(%{"sub" => to_string(user.id)})
      assert retrieved_user.id == user.id
    end

    test "resource_from_claims/1 returns error for invalid user id" do
      result = Guardian.resource_from_claims(%{"sub" => "999999"})
      assert result == {:error, :resource_not_found}
    end
  end
end
