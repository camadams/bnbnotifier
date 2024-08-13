export async function GET(request: Request) {
  // console.log(request.headers.values().next().value);
  console.log("pinged from aws! " + new Date());
  return Response.json({ msg: 1 }, { status: 200 });
}
