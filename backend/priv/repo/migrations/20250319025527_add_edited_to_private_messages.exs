defmodule Api.Repo.Migrations.AddEditedToPrivateMessages do
  use Ecto.Migration

  def change do
    alter table(:private_messages, prefix: System.get_env("DB_SCHEMA")) do
      add(:edited, :boolean, default: false, null: false)
    end
  end
end
