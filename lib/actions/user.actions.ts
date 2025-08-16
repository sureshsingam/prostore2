"use server";

import { z } from "zod";
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
} from "../validators";
import { ShippingAddress } from "@/types";
import { auth, signIn } from "@/auth";
import { signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatErrors } from "../utils";
import { paymentMethodSchema } from "../validators";

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

// SignUp user

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;
    //has the user password
    user.password = hashSync(plainPassword, 10);

    //add to the database
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });
    // sign In user after user registers
    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: formatErrors(error) };
  }
}

//Get User by ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

// update user's address

export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    // get current user from database
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) {
      throw new Error("User Not Found");
    }
    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address: address },
    });
    return {
      success: true,
      message: "User updated succesfully",
    };
  } catch (error) {
    return { success: false, message: formatErrors(error) };
  }
}

// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });
    if (!currentUser) {
      throw new Error("User Not Found");
    }

    const paymentMethod = paymentMethodSchema.parse(data);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });
    return {
      success: true,
      message: "User Updated Successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// update the user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });
    if (!currentUser) {
      throw new Error("User Not Found");
    }
    //if user found
    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: user.name,
      },
    });
    return {
      success: true,
      message: "user updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}
