defmodule Api.Messages.PrivateMessage do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "private_messages" do
    field(:content, :string)
    field(:read, :boolean, default: false)
    field(:edited, :boolean, default: false)
    timestamps(type: :utc_datetime)

    belongs_to(:sender, Api.Accounts.User, foreign_key: :sender_id)
    belongs_to(:receiver, Api.Accounts.User, foreign_key: :receiver_id)
  end

  def changeset(private_message, attrs) do
    private_message
    |> cast(attrs, [:content, :sender_id, :receiver_id])
    |> validate_required([:content, :sender_id, :receiver_id])
    |> validate_length(:content, min: 1, max: 2000)
    |> foreign_key_constraint(:sender_id)
    |> foreign_key_constraint(:receiver_id)
    |> validate_different_users()
  end

  def edit_changeset(private_message, attrs) do
    private_message
    |> cast(attrs, [:content])
    |> validate_required([:content])
    |> validate_length(:content, min: 1, max: 2000)
    |> put_change(:edited, true)
  end

  def read_changeset(private_message) do
    change(private_message, read: true)
  end

  # Validate that sender and receiver are different users
  defp validate_different_users(changeset) do
    sender_id = get_field(changeset, :sender_id)
    receiver_id = get_field(changeset, :receiver_id)

    if sender_id != nil && receiver_id != nil && sender_id == receiver_id do
      add_error(changeset, :receiver_id, "cannot send a message to yourself")
    else
      changeset
    end
  end
end
