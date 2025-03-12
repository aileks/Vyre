defmodule Api.Repo.Migrations.CreateServers do
  use Ecto.Migration

  def change do
    create table(:servers, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :description, :string
      add :icon_url, :string
      add :created_at, :utc_datetime
      add :owner_id, references(:users, on_delete: :nothing, type: :binary_id)

      timestamps(type: :utc_datetime)
    end

    create unique_index(:servers, [:name])
    create index(:servers, [:owner_id])
  end
end
