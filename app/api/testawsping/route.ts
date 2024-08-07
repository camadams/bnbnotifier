export async function POST(request: Request) {
  console.log("pinged from aws!");
  return new Response("ok", { status: 200 });
}
