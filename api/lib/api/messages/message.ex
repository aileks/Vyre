defmodule Api.Messages.Message do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "messages" do
    field(:timestamp, :utc_datetime)
    field(:content, :string)
    field(:edited, :boolean, default: false)
    field(:mentions_everyone, :boolean, default: false)
    field(:user_id, :binary_id)
    field(:channel_id, :binary_id)
    timestamps(type: :utc_datetime)

    belongs_to(:user, Api.Accounts.User, foreign_key: :user_id)
    belongs_to(:channel, Api.Channels.Channel, foreign_key: :channel_id)
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :timestamp, :edited, :mentions_everyone])
    |> validate_required([:content, :timestamp, :edited, :mentions_everyone])
  end
end
