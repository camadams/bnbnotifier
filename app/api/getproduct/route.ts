import { NextResponse } from "next/server";

export async function GET() {
  const endpoint = "https://api.lemonsqueezy.com/v1/products";
  const apiKey =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiI5OGFiYmY4MGE1ZDViZGQ0MGU1NzQ3MWQwYjQ0NGVhNGFkMzBiYmU3ZGE0NTVlODBiNGI3MDRjZDdjZjc3ZDg1ZjVlN2EwZThlM2JhOGIxMiIsImlhdCI6MTcyMTUwOTEzNC42NDk4MjgsIm5iZiI6MTcyMTUwOTEzNC42NDk4MzEsImV4cCI6MjAzNzA0MTkzNC42MjQ0NTYsInN1YiI6IjIyNTIyMjkiLCJzY29wZXMiOltdfQ.k3zroUakmWfR21Rv7gXlR3-pvR7ldt8buYH67WYYC2ZPgUTbJptQ1b0FzLM9l0GJyDGPbzb6TJ6FdgL0AZg7oF-6jGN7RN3OQfmuz4Yw_otDISbSj_pEgBr-2qyB0Pcve3JvgC0RvTt2UMN2-4ZOnp_a0IUFOOwB7PQ_4xO715fhqTJ0utoxw3Y6so7MqY0-3eo8mWUGdpQNQK2woUHd9mwdvV99zUl3v2UEJ66VE_xSDXpDWQw6WLXW3MPZybGk1w6lKtH5jyNKo44pXMe37SOMHtIczPXxdlDysoVd26jbvcXWapZAtLLaw57zvJsAIWboR40WU8-jikPgot-rjvH94JPZQgFGb38fqPt3jdL60hK4HjUtUUGUdUYrlbjJfx-x9czKSV0JhgEg4Hjuby4nZJ7TPEzczCneLuOOPVIohwxYFMsiVI962vh9TFq5uSiZtHlvvxqP5Ru4USIrqixH3PMYApvrvLP4-jPH5Hdu1jaskmhICo9h0g2LeMwI";
  const headers = {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${apiKey}`,
  };

  const res = await fetch(endpoint, { headers });

  const resJson = await res.json();
  // const user_email = resJson.data.attributes.name as string;

  return NextResponse.json({ implement: 1 });
}
