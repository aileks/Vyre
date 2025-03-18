defmodule Api.Repo.Migrations.UpdateServerMembersTable do
  use Ecto.Migration

  def change do
    schema = System.get_env("DB_SCHEMA")

    alter table(:server_members, prefix: schema) do
      add(:nickname, :string)
      remove(:role)
    end

    create_if_not_exists(
      unique_index(:server_members, [:user_id, :server_id],
        name: "server_members_user_id_server_id_index",
        prefix: schema
      )
    )
  end
end
