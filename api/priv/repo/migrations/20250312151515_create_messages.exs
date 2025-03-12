defmodule Api.Repo.Migrations.CreateMessages do
  use Ecto.Migration
  import Api.SchemaHelper

  def change do
    create table(:messages, primary_key: false, prefix: schema_prefix()) do
      add(:id, :binary_id, primary_key: true)
      add(:content, :text)
      add(:edited, :boolean, default: false, null: false)
      add(:mentions_everyone, :boolean, default: false, null: false)
      add(:user_id, references(:users, on_delete: :delete_all, type: :binary_id))
      add(:channel_id, references(:channels, on_delete: :delete_all, type: :binary_id))

      timestamps(type: :utc_datetime)
    end

    create(index(:messages, [:user_id]))
    create(index(:messages, [:channel_id]))
  end
end
