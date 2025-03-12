defmodule Api.Repo.Migrations.AddFriendRequestsToFriendsTable do
  use Ecto.Migration

  def change do
    alter table(:friends) do
      # Values: "pending", "accepted", "declined"
      add(:status, :string, default: "pending")
    end
  end
end
