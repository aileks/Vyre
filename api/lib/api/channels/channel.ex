defmodule Api.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  # Future proofing
  @channel_types ["text", "voice", "announcement"]

  schema "channels" do
    field(:name, :string)
    field(:description, :string)
    field(:topic, :string)
    field(:type, :string, default: "text")
    timestamps(type: :utc_datetime)

    belongs_to(:server, Api.Servers.Server, foreign_key: :server_id, type: :binary_id)
    has_many(:messages, Api.Messages.Message, foreign_key: :message_id, type: :binary_id)
  end

  def changeset(channel, attrs) do
    channel
    |> cast(attrs, [:name, :description, :topic, :type, :server_id])
    |> validate_required([:name, :server_id, :type])
    |> validate_length(:name, min: 1, max: 100)
    |> validate_length(:topic,
      max: 200,
      message: "Topic is too long (maximum is 200 characters)"
    )
    |> validate_length(:description,
      max: 500,
      message: "Description is too long (maximum is 500 characters)"
    )
    |> validate_inclusion(:type, @channel_types,
      message: "must be one of: #{Enum.join(@channel_types, ", ")}"
    )
    |> foreign_key_constraint(:server_id, message: "Server does not exist")
    |> unique_constraint([:server_id, :name],
      message: "A channel with this name already exists in this server"
    )
  end
end
