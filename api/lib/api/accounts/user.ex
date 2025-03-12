defmodule Api.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "users" do
    field(:email, :string)
    field(:username, :string)
    field(:password, :string, virtual: true)
    field(:password_hash, :string)
    field(:display_name, :string)
    field(:avatar_url, :string)
    field(:status, :string, default: "offline")
    timestamps(type: :utc_datetime)

    has_many(:owned_servers, Api.Servers.Server, foreign_key: :owner_id)
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :username, :password, :display_name, :avatar_url, :status])
    |> validate_required([:email, :username, :password])
    |> validate_email()
    |> validate_password()
    |> validate_username()
    |> unique_constraint(:email, message: "Email already taken")
    |> unique_constraint(:username, message: "Username already taken")
    |> hash_password()
  end

  defp validate_email(changeset) do
    changeset
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "Must have the @ sign and no spaces")
    |> validate_length(:email, max: 160)
  end

  defp validate_username(changeset) do
    changeset
    |> validate_format(:username, ~r/^[a-z0-9_-]+$/i,
      message: "Only letters, numbers, underscores and dashes"
    )
    |> validate_length(:username, min: 3, max: 30)
  end

  defp validate_password(changeset) do
    changeset
    |> validate_length(:password, min: 8, max: 80)
  end

  defp hash_password(changeset) do
    password = get_change(changeset, :password)

    if password do
      changeset
      |> put_change(:password_hash, Bcrypt.hash_pwd_salt(password))
    else
      changeset
    end
  end

  def registration_changeset(user, attrs) do
    changeset(user, attrs)
  end
end
