defmodule Api.Factory do
  use ExMachina.Ecto, repo: Api.Repo

  def user_factory do
    %Api.Accounts.User{
      username: Faker.Internet.user_name(),
      display_name: Faker.Name.name(),
      email: Faker.Internet.email(),
      password_hash: "$2a$12$8biYxqUwjS21WD7pigYhjOMAnOd9L9hfKOPjT8dmZq56WfRwVJRD6",
      avatar_url: Faker.Avatar.image_url()
    }
  end

  def server_factory do
    %Api.Servers.Server{
      name: Faker.Company.name(),
      description: Faker.Lorem.sentence(),
      owner_id: build(:user).id,
      icon_url: Faker.Avatar.image_url()
    }
  end
end
