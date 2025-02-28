defmodule Vyre.Chat.Message do
  use Ecto.Schema
  import Ecto.Changeset

  schema "messages" do
    field :index, :string
    field :show, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:index, :show])
    |> validate_required([:index, :show])
  end
end
