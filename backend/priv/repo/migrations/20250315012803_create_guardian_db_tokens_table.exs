defmodule Api.Repo.Migrations.CreateGuardianDbTokensTable do
  use Ecto.Migration

  def change do
    create table(:guardian_tokens) do
      add(:jti, :string, primary_key: true)
      add(:aud, :string, primary_key: true)
      add(:typ, :string)
      add(:iss, :string)
      add(:sub, :string)
      add(:exp, :bigint)
      add(:jwt, :text)
      add(:claims, :map)

      timestamps(type: :utc_datetime)
    end

    create(index(:guardian_tokens, [:jti, :aud]))
    create(index(:guardian_tokens, [:sub, :exp]))
  end
end
