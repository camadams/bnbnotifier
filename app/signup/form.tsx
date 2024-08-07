"use client";
import { useFormState, useFormStatus } from "react-dom";
import { signUp } from "./actions";
import Spinner from "../spinner";
import Arrow from "./../arrow";
export default function SignUpForm() {
  const [state, action] = useFormState(signUp, null);
  const status = useFormStatus();
  return (
    <>
      <h1>Create an account</h1>
      {/* <form action={action}> */}
      <form action={action}>
        <label htmlFor="username">Username</label>
        <input name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <SubmitButton />
      </form>
      <p className="bg-red-400 w-32">{state?.message}</p>
    </>
  );
}

export function SubmitButton() {
  const status = useFormStatus();
  return (
    <button className="ml-2  bg-red-600 text-white rounded-full p-3">
      {status.pending ? <Spinner /> : <Arrow />}
    </button>
  );
}
