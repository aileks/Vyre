defmodule ApiWeb.ErrorJSONTest do
  use ApiWeb.ConnCase, async: true
  alias Ecto.Changeset
  alias ApiWeb.ErrorJSON

  import Phoenix.ConnTest
  @endpoint ApiWeb.Endpoint

  test "renders 404" do
    assert ApiWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 404.json with custom message" do
    assert ErrorJSON.render("404.json", %{message: "Resource not found"}) == %{
             errors: %{detail: "Resource not found"}
           }
  end

  test "renders 401.json" do
    assert ErrorJSON.render("401.json", %{}) == %{
             errors: %{detail: "Unauthorized"}
           }
  end

  test "renders 500" do
    assert ApiWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end

  test "renders 422.json with changeset errors" do
    changeset =
      {%{}, %{name: :string, email: :string}}
      |> Changeset.cast(%{}, [:name, :email])
      |> Changeset.validate_required([:name, :email])

    result = ErrorJSON.render("422.json", %{changeset: changeset})

    assert result == %{
             errors: %{
               name: ["can't be blank"],
               email: ["can't be blank"]
             }
           }
  end

  test "renders any error as JSON with status code message" do
    assert ErrorJSON.render("403.json", %{}) == %{
             errors: %{detail: "Forbidden"}
           }

    assert ErrorJSON.render("400.json", %{}) == %{
             errors: %{detail: "Bad Request"}
           }
  end
end
