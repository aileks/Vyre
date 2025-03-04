defmodule Api.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add(:id, :binary_id, primary_key: true)
      add(:username, :string)
      add(:display_name, :string)
      add(:email, :string)
      add(:password, :string)
      add(:avatar_url, :string)
      add(:status, :string)

      timestamps(type: :utc_datetime)
    end

    create(unique_index(:users, [:email]))
    create(unique_index(:users, [:username]))
  end
end
