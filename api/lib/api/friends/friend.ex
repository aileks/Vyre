defmodule Api.Friends.Friend do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "friends" do
    belongs_to(:user, Api.Accounts.User, foreign_key: :user_id)
    belongs_to(:friend, Api.Accounts.User, foreign_key: :friend_id)

    timestamps(type: :utc_datetime)
  end

  def changeset(friend, attrs) do
    friend
    |> cast(attrs, [:user_id, :friend_id])
    |> validate_required([:user_id, :friend_id])
  end
end
