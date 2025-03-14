defmodule Api.Friends do
  @moduledoc """
  The Friends context.
  """

  import Ecto.Query, warn: false
  alias Api.Repo
  alias Api.Friends.Friend

  @doc """
  Returns the list of friends.

  ## Examples

      iex> list_friends()
      [%Friend{}, ...]

  """
  def list_friends do
    Repo.all(Friend)
  end

  @doc """
  Gets a single friend.

  Raises `Ecto.NoResultsError` if the Friend does not exist.

  ## Examples

      iex> get_friend!(123)
      %Friend{}

      iex> get_friend!(456)
      ** (Ecto.NoResultsError)

  """
  def get_friend!(id), do: Repo.get!(Friend, id)

  @doc """
  Creates a friend.

  ## Examples

      iex> create_friend(%{field: value})
      {:ok, %Friend{}}

      iex> create_friend(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_friend(attrs \\ %{}) do
    %Friend{}
    |> Friend.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a friend.

  ## Examples

      iex> update_friend(friend, %{field: new_value})
      {:ok, %Friend{}}

      iex> update_friend(friend, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_friend(%Friend{} = friend, attrs) do
    friend
    |> Friend.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a friend.

  ## Examples

      iex> delete_friend(friend)
      {:ok, %Friend{}}

      iex> delete_friend(friend)
      {:error, %Ecto.Changeset{}}

  """
  def delete_friend(%Friend{} = friend) do
    Repo.delete(friend)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking friend changes.

  ## Examples

      iex> change_friend(friend)
      %Ecto.Changeset{data: %Friend{}}

  """
  def change_friend(%Friend{} = friend, attrs \\ %{}) do
    Friend.changeset(friend, attrs)
  end

  # ---------------------------------------------- #
  #          Friend Request Service Logic          #
  # ---------------------------------------------- #

  @doc """
  Sends a friend request from one user to another.
  """
  def send_friend_request(user_id, friend_id) do
    if user_id == friend_id do
      {:error, "You cannot add yourself as a friend."}
    else
      case Repo.get_by(Friend, user_id: user_id, friend_id: friend_id) do
        nil ->
          %Friend{}
          |> Friend.changeset(%{user_id: user_id, friend_id: friend_id, status: "pending"})
          |> Repo.insert()

        _ ->
          {:error, "Friend request already exists"}
      end
    end
  end

  @doc """
  Accepts a pending friend request.
  """
  def accept_friend_request(user_id, friend_id) do
    case Repo.get_by(Friend, user_id: friend_id, friend_id: user_id, status: "pending") do
      nil ->
        {:error, "No pending friend request found"}

      request ->
        request
        |> Friend.changeset(%{status: "accepted"})
        |> Repo.update()
    end
  end

  @doc """
  Declines a friend request (deletes the record).
  """
  def decline_friend_request(user_id, friend_id) do
    case Repo.get_by(Friend, user_id: friend_id, friend_id: user_id, status: "pending") do
      nil -> {:error, "No pending friend request found"}
      request -> Repo.delete(request)
    end
  end

  @doc """
  Fetches all pending friend requests for a user.
  """
  def get_pending_friend_requests(user_id) do
    from(f in Friend,
      where: f.friend_id == ^user_id and f.status == "pending",
      preload: [:user]
    )
    |> Repo.all()
  end

  @doc """
  Fetches all accepted friends for a user.
  """
  def get_friends(user_id) do
    from(f in Friend,
      where: (f.user_id == ^user_id or f.friend_id == ^user_id) and f.status == "accepted",
      preload: [:user, :friend]
    )
    |> Repo.all()
  end
end
