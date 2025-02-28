defmodule Vyre.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :index, :string
      add :show, :string

      timestamps(type: :utc_datetime)
    end
  end
end
