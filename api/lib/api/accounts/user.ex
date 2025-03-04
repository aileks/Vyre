defmodule Api.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users" do
    field(:status, :string)
    field(:username, :string)
    field(:display_name, :string)
    field(:email, :string)
    field(:password, :string)
    field(:avatar_url, :string)

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :display_name, :email, :password, :avatar_url, :status])
    |> validate_required([:username, :display_name, :email, :password, :avatar_url, :status])
    |> unique_constraint(:email)
    |> unique_constraint(:username)
  end
end
