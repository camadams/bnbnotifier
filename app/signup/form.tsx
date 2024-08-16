"use client";
import { useFormState, useFormStatus } from "react-dom";
import { signUp } from "./actions";
import Spinner from "../spinner";
import Arrow from "./../arrow";
export default function SignUpForm() {
  const [state, action] = useFormState(signUp, null);
  const status = useFormStatus();
  return (
    <div className="flex mt-16 justify-center">
      <div className="rounded-lg bg-slate-200 shadow-orange-100 shadow-2xl p-16 ">
        <h1>Create an account</h1>
        {/* <form action={action}> */}
        <form action={action} className="space-y-6">
          <label htmlFor="username">Username</label>
          <input className="ml-2 rounded-lg" name="username" id="username" />
          <br />
          <label htmlFor="password">Password</label>
          <input
            className="ml-2 rounded-lg"
            type="password"
            name="password"
            id="password"
          />
          <br />
          <label htmlFor="emailAddress">Email Address</label>
          <input
            className="ml-2 rounded-lg"
            type="email"
            name="emailAddress"
            id="emailAddress"
          />
          <br />
          <SubmitButton />
        </form>
        <p className="bg-red-400 w-32">{state?.message}</p>
      </div>
    </div>
  );
}

export function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      className={`ml-2  bg-red-600 text-white rounded-full p-3 ${
        status.pending ? "pointer-events-none bg-red-300" : "bg-red-600"
      }`}
    >
      {status.pending ? <Spinner /> : <Arrow />}
    </button>
  );
}
