defmodule ApiWeb.ErrorJSON do
  @moduledoc """
  This module is invoked by your endpoint in case of errors on JSON requests.

  See config/config.exs.
  """
  def render("404.json", _assigns) do
    %{error: %{message: "Not Found"}}
  end

  def render("401.json", %{error: message}) do
    %{error: %{message: message}}
  end

  def render("401.json", _assigns) do
    %{error: %{message: "Unauthorized"}}
  end

  def render("403.json", _assigns) do
    %{error: %{message: "Forbidden"}}
  end

  def render("422.json", %{changeset: changeset}) do
    %{error: translate_errors(changeset)}
  end

  def render("500.json", _assigns) do
    %{error: %{message: "Internal Server Error"}}
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      translate_error({msg, opts})
    end)
  end

  defp translate_error({msg, opts}) do
    Enum.reduce(opts, msg, fn {key, value}, acc ->
      String.replace(acc, "%{#{key}}", fn _ -> to_string(value) end)
    end)
  end
end
