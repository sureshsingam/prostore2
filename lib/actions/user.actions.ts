"use server";

import { signInFormSchema } from "../validators";
import { signIn } from "@/auth";
import { signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// sign in the user with credentials (using credential provider)

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Extract callback URL from form data
    const callbackUrl = (formData.get("callbackUrl") as string) || "/";

    // Pass callback URL to NextAuth
    await signIn("credentials", user, { redirectTo: callbackUrl });
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: "Invalid email or password" };
  }
}

//Sign user out

export async function signOutUser() {
  await signOut();
}
