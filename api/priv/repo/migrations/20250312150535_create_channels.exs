defmodule Api.Repo.Migrations.CreateChannels do
  use Ecto.Migration

  def change do
    create table(:channels, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:name, :string, null: false)
      add(:description, :string)
      add(:topic, :string)
      add(:type, :string, default: "text", null: false)
      add(:server_id, references(:servers, on_delete: :delete_all, type: :binary_id))
      add(:pm_user_id, references(:users, on_delete: :delete_all, type: :binary_id))

      timestamps(type: :utc_datetime)
    end

    create(index(:channels, [:server_id]))
    create(index(:channels, [:pm_user_id]))
    create(index(:channels, [:type]))
  end
end
