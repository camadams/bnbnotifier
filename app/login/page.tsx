"use client";
import { useFormState, useFormStatus } from "react-dom";
import Arrow from "../arrow";
import Spinner from "../spinner";
import { logIn } from "./action";

export default function Page() {
  const [state, action] = useFormState(logIn, null);
  return (
    <div className="flex mt-16 justify-center">
      <div className="rounded-lg bg-slate-200 shadow-orange-100 shadow-2xl p-16 ">
        <h1>Log In</h1>
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
          <SubmitButton />
        </form>
        <p className="bg-red-400 w-32">{state?.message}</p>
      </div>
    </div>
  );
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button className="ml-2  bg-red-600 text-white rounded-full p-3">
      {status.pending ? <Spinner /> : <Arrow />}
    </button>
  );
}
