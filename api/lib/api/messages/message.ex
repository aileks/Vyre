defmodule Api.Messages.Message do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "messages" do
    field(:content, :string)
    field(:edited, :boolean, default: false)
    field(:mentions_everyone, :boolean, default: false)
    field(:timestamp, :utc_datetime, default: DateTime.utc_now() |> DateTime.truncate(:second))
    timestamps(type: :utc_datetime)

    belongs_to(:user, Api.Accounts.User)
    belongs_to(:channel, Api.Channels.Channel)
  end

  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :mentions_everyone, :user_id, :channel_id])
    |> validate_required([:content, :user_id, :channel_id])
    |> validate_length(:content, min: 1, max: 2000)
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:channel_id)
  end

  def edit_changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :mentions_everyone])
    |> validate_required([:content])
    |> validate_length(:content, min: 1, max: 2000)
    |> put_change(:edited, true)
  end
end
