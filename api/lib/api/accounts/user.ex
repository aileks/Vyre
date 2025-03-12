defmodule Api.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset

  @schema_prefix Api.SchemaHelper.schema_prefix()
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
    has_many(:messages, Api.Messages.Message)
    has_many(:server_memberships, Api.Servers.ServerMember)
    has_many(:servers, through: [:server_memberships, :server])
    has_many(:sent_private_messages, Api.Messages.PrivateMessage, foreign_key: :sender_id)
    has_many(:received_private_messages, Api.Messages.PrivateMessage, foreign_key: :receiver_id)
    many_to_many(:roles, Api.Roles.Role, join_through: Api.Roles.UserRole)
    has_many(:friendships, Api.Friends.Friend, foreign_key: :user_id)
    has_many(:friend_requests, Api.Friends.Friend, foreign_key: :friend_id)
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
    |> validate_length(:password,
      min: 8,
      max: 80,
      message: "Password must be at least 8 characters"
    )

    # |> validate_format(:password, ~r/[A-Z]/,
    #   message: "Password must contain at least one uppercase letter"
    # )
    # |> validate_format(:password, ~r/[a-z]/,
    #   message: "Password must contain at least one lowercase letter"
    # )
    # |> validate_format(:password, ~r/[0-9]/, message: "Password must contain at least one number")
    # |> validate_format(:password, ~r/[^A-Za-z0-9]/,
    #   message: "Password must contain at least one special character"
    # )
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

  def update_changeset(user, attrs) do
    user
    |> cast(attrs, [:display_name, :avatar_url, :status])
    |> validate_inclusion(:status, ["online", "offline", "idle", "do_not_disturb"])
  end

  # def password_changeset(user, attrs) do
  #   user
  #   |> cast(attrs, [:password])
  #   |> validate_required([:password])
  #   |> validate_password()
  #   |> hash_password()
  # end

  @doc """
  Gets all private messages for a user, both sent and received.
  Returns a query that can be further composed.
  """
  def all_private_messages(%__MODULE__{} = user) do
    user_id = user.id

    import Ecto.Query

    from(p in Api.Messages.PrivateMessage,
      where: p.sender_id == ^user_id or p.receiver_id == ^user_id,
      order_by: [desc: p.timestamp],
      select: p
    )
  end
end
