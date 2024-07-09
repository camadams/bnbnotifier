"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addEmailForSignUp } from "./actions";
import Spinner from "../spinner";

export default function Form() {
  const [state, action] = useFormState(addEmailForSignUp, null);
  return (
    <form action={action} className="flex items-center">
      <input
        className="md:p-8 p-2 rounded-lg w-fit "
        placeholder="Enter your email address"
        type="email"
        name="email"
      />
      <SubmitButton />
      {state?.message}
    </form>
  );
}

export function SubmitButton() {
  const status = useFormStatus();
  return (
    <button className="ml-2  bg-red-600 text-white rounded-full p-3">
      {status.pending ? (
        <Spinner />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}
