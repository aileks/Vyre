defmodule Api.Auth.GuardianTest do
  use Api.DataCase, async: true

  alias Api.Accounts
  alias Api.Auth.Guardian

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

    test "create_token/1 returns a valid token", %{user: user} do
      token = Guardian.create_token(user)
      assert is_binary(token)

      # Verify the token can be decoded and contains the correct user
      {:ok, claims} = Guardian.decode_and_verify(token)
      assert claims["sub"] == to_string(user.id)

      # Check TTL is approximately 1 hour (allowing for test execution time)
      now = DateTime.utc_now() |> DateTime.to_unix()
      assert claims["exp"] - now > 3500
      assert claims["exp"] - now < 3700
    end

    test "create_refresh_token/1 returns a valid refresh token", %{user: user} do
      token = Guardian.create_refresh_token(user)
      assert is_binary(token)

      # Verify the token can be decoded and contains the correct user
      {:ok, claims} = Guardian.decode_and_verify(token)
      assert claims["sub"] == to_string(user.id)
      assert claims["type"] == "refresh"

      # Check TTL is approximately 1 month (allowing for test execution time)
      now = DateTime.utc_now() |> DateTime.to_unix()
      assert claims["exp"] - now > 30 * 24 * 3600 - 100
      assert claims["exp"] - now < 30 * 24 * 3600 + 100
    end

    test "get_resource_from_token/1 returns user for valid token", %{user: user} do
      token = Guardian.create_token(user)

      {:ok, retrieved_user} = Guardian.get_resource_from_token(token)
      assert retrieved_user.id == user.id
    end

    test "get_resource_from_token/1 returns error for invalid token" do
      result = Guardian.get_resource_from_token("invalid_token")
      assert {:error, _reason} = result
    end
  end
end
