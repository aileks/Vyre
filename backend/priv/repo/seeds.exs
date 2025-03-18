alias Api.Repo
alias Api.Factory
alias Api.Servers.Server

Application.ensure_all_started(:faker)

IO.puts("\nSEEDS STARTING\n")

users = Factory.insert_list(20, :user)

owners = Enum.take_random(users, 5)

Enum.each(owners, fn owner ->
  num_servers = Enum.random(1..3)

  Enum.each(1..num_servers, fn _ ->
    Factory.insert(:server, owner_id: owner.id)
  end)
end)

# Get all servers for other seeders
servers = Repo.all(Server)

channels =
  for server <- servers do
    num_channels = Enum.random(1..8)

    Enum.map(1..num_channels, fn _ ->
      Factory.insert(:channel, server_id: server.id)
    end)
  end

# Flatten the list in case it's nested.
channels = List.flatten(channels)

Enum.each(servers, fn server ->
  unless Repo.get_by(Api.Servers.ServerMember, user_id: server.owner_id, server_id: server.id) do
    Factory.insert(:server_member, user_id: server.owner_id, server_id: server.id)
  end
end)

Enum.each(servers, fn server ->
  potential_members = Enum.filter(users, fn user -> user.id != server.owner_id end)

  num_members = Enum.random(3..10)
  members_to_add = Enum.take_random(potential_members, num_members)

  Enum.each(members_to_add, fn user ->
    unless Repo.get_by(Api.Servers.ServerMember, user_id: user.id, server_id: server.id) do
      Factory.insert(:server_member,
        user_id: user.id,
        server_id: server.id,
        nickname: user.display_name
      )
    end
  end)
end)

Enum.each(channels, fn channel ->
  num_messages = Enum.random(1..10)

  Enum.each(1..num_messages, fn _ ->
    user = Enum.random(users)
    Factory.insert(:message, channel_id: channel.id, user_id: user.id)
  end)
end)

all_possible_pairs = for u <- users, f <- users, u.id != f.id, do: {u.id, f.id}

pairs_to_insert =
  all_possible_pairs
  |> Enum.shuffle()
  |> Enum.take(10)

Enum.each(pairs_to_insert, fn {user_id, friend_id} ->
  Factory.insert(:friend, user_id: user_id, friend_id: friend_id)
end)
