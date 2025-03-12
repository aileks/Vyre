defmodule Api.Repo.Migrations.CreateUserRoles do
  use Ecto.Migration
  import Api.SchemaHelper

  def change do
    create table(:user_roles, primary_key: false, prefix: schema_prefix()) do
      add(:id, :binary_id, primary_key: true)
      add(:user_id, references(:users, on_delete: :delete_all, type: :binary_id))
      add(:role_id, references(:roles, on_delete: :delete_all, type: :binary_id))
      add(:server_id, references(:servers, on_delete: :delete_all, type: :binary_id))

      timestamps(type: :utc_datetime)
    end

    create(index(:user_roles, [:user_id]))
    create(index(:user_roles, [:role_id]))
    create(index(:user_roles, [:server_id]))
  end
end
