"use server";

import { z } from "zod";
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateUserSchema,
} from "../validators";
import { ShippingAddress } from "@/types";
import { auth, signIn } from "@/auth";
import { signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatErrors } from "../utils";
import { paymentMethodSchema } from "../validators";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { getMyCart } from "./cart.action";

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
  // get current users cart and delete it so it does not persist to next user
  const currentCart = await getMyCart();
  await prisma.cart.delete({ where: { id: currentCart?.id } });
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

// Get All the users

export async function getAllUsers({
  query,
  limit = PAGE_SIZE,
  page,
}: {
  query?: string;
  limit?: number;
  page: number;
}) {
  // Build the where clause for filtering
  const whereClause: {
    OR?: Array<{
      name?: { contains: string; mode: "insensitive" };
      email?: { contains: string; mode: "insensitive" };
      role?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  // Add search query filter if provided
  if (query && query.trim() !== "") {
    whereClause.OR = [
      {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        role: {
          contains: query,
          mode: "insensitive",
        },
      },
    ];
  }

  const data = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count({
    where: whereClause,
  });

  return {
    data: data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// delete user by admin
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id: id },
    });
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

// Update a user by admin
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}
