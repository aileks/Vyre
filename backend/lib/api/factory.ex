defmodule Api.Factory do
  use ExMachina.Ecto, repo: Api.Repo

  # -------------------------------------------------------------------
  # USERS
  # -------------------------------------------------------------------
  def user_factory do
    %Api.Accounts.User{
      username: Faker.Internet.user_name(),
      display_name: Faker.Internet.user_name(),
      email: Faker.Internet.email(),
      password_hash: "$2a$12$zbmjpxEpDwtIKLmK0lWY1..DbcsxsWuJDzPFE2TKYGsCy2Bt8SNJC",
      avatar_url: Faker.Avatar.image_url(),
      inserted_at: Faker.DateTime.backward(Enum.random(1..30)),
      updated_at: Faker.DateTime.between(~N[2024-12-01T00:00:00Z], ~N[2025-03-01T23:59:59Z])
    }
  end

  # -------------------------------------------------------------------
  # FRIENDS
  # -------------------------------------------------------------------
  def friend_factory do
    %Api.Friends.Friend{
      user_id: build(:user).id,
      friend_id: build(:user).id,
      status: Enum.random(["pending", "accepted"]),
      inserted_at: Faker.DateTime.backward(Enum.random(1..30)),
      updated_at: Faker.DateTime.between(~N[2024-12-01T00:00:00Z], ~N[2025-03-01T23:59:59Z])
    }
  end

  # -------------------------------------------------------------------
  # SERVERS
  # -------------------------------------------------------------------
  def server_factory do
    %Api.Servers.Server{
      name: Faker.Company.name(),
      description: Faker.Lorem.sentence(),
      owner_id: build(:user).id,
      icon_url: Faker.Avatar.image_url(),
      inserted_at: Faker.DateTime.backward(Enum.random(1..30)),
      updated_at: Faker.DateTime.between(~N[2024-12-01T00:00:00Z], ~N[2025-03-01T23:59:59Z])
    }
  end

  # -------------------------------------------------------------------
  # SERVER MEMBERS
  # -------------------------------------------------------------------
  def server_member_factory do
    %Api.Servers.ServerMember{
      user_id: build(:user).id,
      server_id: build(:server).id,
      nickname: Enum.random([nil, Faker.Superhero.name(), Faker.Internet.user_name()]),
      joined_at: Faker.DateTime.backward(Enum.random(1..30))
    }
  end

  # -------------------------------------------------------------------
  # CHANNELS
  # -------------------------------------------------------------------
  def channel_factory do
    %Api.Channels.Channel{
      server_id: build(:server).id,
      name: Faker.Address.city(),
      description: Faker.Lorem.sentence(),
      topic: Faker.Lorem.sentence(),
      inserted_at: Faker.DateTime.backward(Enum.random(1..30)),
      updated_at: Faker.DateTime.between(~N[2024-12-01T00:00:00Z], ~N[2025-03-01T23:59:59Z])
    }
  end

  # -------------------------------------------------------------------
  # MESSAGES
  # -------------------------------------------------------------------
  def message_factory do
    %Api.Messages.Message{
      content: Faker.Lorem.paragraph(),
      user_id: build(:user).id,
      channel_id: build(:channel).id,
      edited: Enum.random([false, true]),
      mentions_everyone: Enum.random([false, true]),
      inserted_at: Faker.DateTime.backward(Enum.random(1..30)),
      updated_at: Faker.DateTime.between(~N[2024-12-01T00:00:00Z], ~N[2025-03-01T23:59:59Z])
    }
  end

  # -------------------------------------------------------------------
  # PRIVATE MESSAGES
  # -------------------------------------------------------------------
  def private_message_factory do
    # TODO
  end

  # -------------------------------------------------------------------
  # ROLES (for a server)
  # -------------------------------------------------------------------
  def role_factory do
    # TODO
  end

  # -------------------------------------------------------------------
  # USER ROLES (association between users and roles)
  # -------------------------------------------------------------------
  def user_role_factory do
    # TODO
  end
end
