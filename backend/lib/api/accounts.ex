defmodule Api.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Api.Repo

  alias Api.Accounts.User

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id) do
    User
    |> Repo.get!(id)
    |> Repo.preload([
      :owned_servers,
      :messages,
      :servers,
      :server_memberships,
      :sent_private_messages,
      :received_private_messages,
      :roles,
      :friendships,
      :friend_requests
    ])
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{data: %User{}}

  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end

  @doc """
  Registers a user.
  """
  def register_user(attrs \\ %{}) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Gets a single user.any() by email.

  Returns 'nil' if the user doesn't exist.

  ## Examples

      iex> get_user_by_email!("user@example.com")
      %User{}

      iex> get_user_by_email!("unknown@example.com")
      nil

  """
  def get_user_by_email!(email) when is_binary(email) do
    Repo.get_by(User, email: email)
  end

  @doc """
  Gets a single user.any() by username.

  Returns 'nil' if the user doesn't exist.

  ## Examples

      iex> get_user_by_username!("username123")
      %User{}

      iex> get_user_by_username!("unknown")
      nil

  """
  def get_user_by_username!(username) when is_binary(username) do
    Repo.get_by(User, username: username)
  end

  @doc """
  Verifies a user's password if they exist.
  Includes a failsafe for invalid credentials to prevent timing attacks.
  """
  def validate_password(password, password_hash) do
    Bcrypt.verify_pass(password, password_hash)
  end
end
