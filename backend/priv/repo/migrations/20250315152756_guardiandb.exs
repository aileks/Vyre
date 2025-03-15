defmodule Api.Repo.Migrations.CreateGuardianDBTokensTable do
  use Ecto.Migration

  def change do
    create table(:guardian_tokens, primary_key: false, prefix: System.get_env("DB_SCHEMA")) do
      add(:jti, :string, primary_key: true)
      add(:aud, :string, primary_key: true)
      add(:typ, :string)
      add(:iss, :string)
      add(:sub, :string)
      add(:exp, :bigint)
      add(:jwt, :text)
      add(:claims, :map)
      timestamps()
    end
  end
end
