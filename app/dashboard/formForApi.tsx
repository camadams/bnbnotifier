// components/MyForm.tsx

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import Spinner from "../spinner";
import { User } from "lucia";
import LoadingBlock from "./loadingBlock";
import { revalidatePath } from "next/cache";

export default function MyForm({ user }: { user: User | null }) {
  const [message, setMessage] = useState("");

  async function handleSubmit(data: FormData) {
    const airbnbUrl = data.get("airbnbUrl") as string;
    const userId = data.get("userId") as string;
    try {
      const response = await fetch(
        `${
          process.env.NODE_ENV == "development"
            ? "http://localhost:3000"
            : "https://www.bnbnotifier.com"
        }/api/addnewurl`,
        {
          method: "POST",
          body: JSON.stringify({ airbnbUrl, userId }),
        }
      );

      if (response.ok) {
        setMessage(await response.text());
      } else {
        const result = await response.json();
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    } finally {
      window.location.reload();
      // revalidatePath("/dashboard");
    }
  }

  function SubmitButton() {
    const status = useFormStatus();
    return (
      <button disabled={status.pending}>
        {status.pending ? (
          <span>
            <Spinner />
          </span>
        ) : (
          "Save"
        )}
      </button>
    );
  }

  if (!user) {
    return <LoadingBlock />;
  }

  return (
    <form action={handleSubmit}>
      <div className="flex">
        <label htmlFor="airbnbUrl">URL</label>
        <input
          className="ml-2 rounded-lg ring-1"
          type="url"
          name="airbnbUrl"
          id="airbnbUrl"
        />
        <input hidden name="userId" defaultValue={user?.id} />
      </div>
      <SubmitButton />
      {message && <p>{message}</p>}
    </form>
  );
}
