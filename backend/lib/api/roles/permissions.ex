defmodule Api.Roles.Permissions do
  @moduledoc """
    THIS IS UNTESTED

    Binary flags for permissions
  """
  import Bitwise

  @permissions %{
    VIEW_CHANNELS: 1 <<< 0,
    SEND_MESSAGES: 1 <<< 1,
    MODERATE: 1 <<< 2,
    ADMINISTRATOR: 1 <<< 3,
    MANAGE_ROLES: 1 <<< 4,
    MANAGE_CHANNELS: 1 <<< 5,
    MANAGE_SERVER: 1 <<< 6,
    KICK_MEMBERS: 1 <<< 7,
    BAN_MEMBERS: 1 <<< 8,
    MANAGE_MESSAGES: 1 <<< 9,
    UPLOAD_FILES: 1 <<< 10,
    ADD_REACTIONS: 1 <<< 11,
    MENTION_EVERYONE: 1 <<< 12
  }

  # Check if a permission is present in the bitfield
  def has_permission?(bitfield, permission) when is_integer(bitfield) and is_atom(permission) do
    permission_value = @permissions[permission] || 0
    (bitfield &&& permission_value) == permission_value
  end

  # Check if the ADMINISTRATOR permission is set
  def is_admin?(bitfield) when is_integer(bitfield) do
    has_permission?(bitfield, :ADMINISTRATOR)
  end

  # Convert permission names to bitfield
  def permissions_to_bitfield(permission_names) when is_list(permission_names) do
    Enum.reduce(permission_names, 0, fn permission_name, acc ->
      permission_value = @permissions[String.to_existing_atom(permission_name)] || 0
      acc ||| permission_value
    end)
  end

  # Convert bitfield to permission names
  def bitfield_to_permissions(bitfield) when is_integer(bitfield) do
    @permissions
    |> Enum.filter(fn {_name, value} -> (bitfield &&& value) == value end)
    |> Enum.map(fn {name, _value} -> name end)
  end

  # Get all available permissions
  def all_permissions do
    Map.keys(@permissions)
  end
end
