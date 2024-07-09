import Form from "./form";

export default function Home() {
  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <div className="flex items-center justify-center py-24 container  md:px-32 px-8 flex-col gap-4 ">
      <h1>Sign up early to get free notifications </h1>
      <div className="bg-red-100 w-full md:p-16 p-8 rounded-lg flex md:gap-12 gap-6 items-center flex-col">
        <h2 className="text-center">Join the Waitlist now</h2>
        <Form />
      </div>
    </div>
  );
}
