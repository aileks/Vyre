defmodule Api.Messages.PrivateMessage do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "private_messages" do
    field(:timestamp, :utc_datetime)
    field(:read, :boolean, default: false)
    field(:content, :string)
    field(:sender_id, :binary_id)
    field(:receiver_id, :binary_id)
    timestamps(type: :utc_datetime)

    belongs_to(:sender, Api.Accounts.User, foreign_key: :sender_id)
    belongs_to(:receiver, Api.Accounts.User, foreign_key: :receiver_id)
  end

  @doc false
  def changeset(private_message, attrs) do
    private_message
    |> cast(attrs, [:content, :timestamp, :read])
    |> validate_required([:content, :timestamp, :read])
  end
end
