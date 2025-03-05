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

  # Handle validation errors
  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("422.json", changeset: changeset)
  end

  def call(conn, {:error, :invalid_credentials}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(json: ApiWeb.ErrorJSON)
    |> render("401.json", %{error: "Invalid email/username or password"})
  end
end
