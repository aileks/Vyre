defmodule Api.Channels.Channel do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "channels" do
    field(:name, :string, null: false)
    field(:type, :string, default: "text")
    field(:description, :string)
    field(:topic, :string)
    field(:server_id, :binary_id)
    field(:pm_user_id, :binary_id)
    timestamps(type: :utc_datetime)

    belongs_to(:server, Api.Servers.Server, foreign_key: :server_id)
    belongs_to(:pm_user, Api.Accounts.User, foreign_key: :pm_user_id)
    has_many(:messages, Api.Messaging.Message)
  end

  def changeset(channel, attrs) do
    channel
    |> cast(attrs, [:name, :description, :topic, :type, :server_id, :pm_user_id])
    |> validate_required([:name, :type])
    |> validate_pm_or_server()
    |> validate_type()
  end

  # Validate that a channel is either a PM channel or belongs to a server
  defp validate_pm_or_server(changeset) do
    type = get_field(changeset, :type)
    server_id = get_field(changeset, :server_id)
    pm_user_id = get_field(changeset, :pm_user_id)

    case {type, server_id, pm_user_id} do
      {"private", nil, pm_user_id} when not is_nil(pm_user_id) ->
        changeset

      {_type, server_id, _} when not is_nil(server_id) ->
        changeset

      _ ->
        add_error(
          changeset,
          :base,
          "Channel must either belong to a server or be a private message channel"
        )
    end
  end

  defp validate_type(changeset) do
    validate_inclusion(changeset, :type, ["text", "voice", "private"])
  end
end
