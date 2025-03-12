defmodule Api.Repo.Migrations.CreateServers do
  use Ecto.Migration

  def change do
    create table(:servers, primary_key: false, prefix: schema_prefix()) do
      add(:id, :binary_id, primary_key: true)
      add(:name, :string, null: false)
      add(:description, :string)
      add(:icon_url, :string)
      add(:owner_id, references(:users, on_delete: :restrict, type: :binary_id), null: false)
      timestamps(type: :utc_datetime)
    end

    create(unique_index(:servers, [:name]))
    create(index(:servers, [:owner_id]))
  end
end
