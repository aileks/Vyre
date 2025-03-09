defmodule ApiWeb.FallbackController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.

  Provides error handling for actions in all API controllers.
  """
  use ApiWeb, :controller

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("404.json")
  end

  # Handle Ecto.NoResultsError
  def call(conn, {:error, %Ecto.NoResultsError{}}) do
    conn
    |> put_status(:not_found)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("404.json", %{message: "Resource not found"})
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("401.json")
  end

  def call(conn, {:error, :invalid_credentials}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("401.json", %{error: "Invalid email or password"})
  end

  # Handle validation errors
  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    # Check if this is a unique constraint error specifically
    if has_unique_constraint_error?(changeset) do
      conn
      # Return 400 instead of 422
      |> put_status(:bad_request)
      |> put_view(json: ApiWeb.ErrorJSON)
      |> render("400.json", %{error: get_error_message(changeset)})
    else
      conn
      |> put_status(:unprocessable_entity)
      |> put_view(json: ApiWeb.ErrorJSON)
      |> render("422.json", changeset: changeset)
    end
  end

  # Helper to detect unique constraint errors
  defp has_unique_constraint_error?(changeset) do
    Enum.any?(changeset.errors, fn
      {:email, {msg, _}} -> msg == "Email already taken"
      {:username, {msg, _}} -> msg == "Username already taken"
      _ -> false
    end)
  end

  # Helper to get the error message
  defp get_error_message(changeset) do
    # Find the first unique constraint error message
    changeset.errors
    |> Enum.find_value(fn
      {:email, {msg, _}} when msg == "Email already taken" -> msg
      {:username, {msg, _}} when msg == "Username already taken" -> msg
      _ -> nil
    end)
  end
end
