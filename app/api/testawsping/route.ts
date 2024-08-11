export async function GET(request: Request) {
  console.log("pinged from aws!");
  return Response.json({ msg: 1 }, { status: 200 });
}
