defmodule Api.Friends.Friend do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:id, :status, :user_id, :friend_id, :inserted_at]}

  @schema_prefix System.get_env("DB_SCHEMA")
  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "friends" do
    # "pending" or "accepted"
    field(:status, :string, default: "pending")
    timestamps(type: :utc_datetime)

    belongs_to(:user, Api.Accounts.User, foreign_key: :user_id)
    belongs_to(:friend, Api.Accounts.User, foreign_key: :friend_id)
  end

  def changeset(friend, attrs) do
    friend
    |> cast(attrs, [:user_id, :friend_id, :status])
    |> validate_required([:user_id, :friend_id, :status])
    |> validate_inclusion(:status, ["pending", "accepted"])
    |> unique_constraint([:user_id, :friend_id], message: "You've already sent a friend request")
  end
end
