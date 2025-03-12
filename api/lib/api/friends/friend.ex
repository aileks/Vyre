defmodule Api.Friends.Friend do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "friends" do
    field(:user_id, :binary_id)
    field(:friend_id, :binary_id)

    timestamps(type: :utc_datetime)
  end

  def changeset(friend, attrs) do
    friend
    |> cast(attrs, [])
    |> validate_required([])
  end
end
