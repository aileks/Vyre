defmodule Api.RateLimit do
  use Hammer, backend: :ets
end
