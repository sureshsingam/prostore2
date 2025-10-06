"use server";

import z from "zod";
import { insertReviewSchema } from "../validators";
import { formatErrors } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";

// Create and update Reviews

export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("User is not authenticated");
    }

    // Validate and store the review data
    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    // Get the product that is being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    // check if user already reviewed the product
    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        //updateReview
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            title: review.title,
            description: review.description,
            rating: review.rating,
          },
        });
      } else {
        // Create a review
        await tx.review.create({
          data: review,
        });
      }

      // Get Average Rating
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      // Get Number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      //update the rating and numReviews in product table
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);
    return {
      success: true,
      message: "Review updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

//Get all views for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return { data };
}

//Get review written by the current user
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();
  if (!session) {
    throw new Error("User is not authenticated");
  }
  return await prisma.review.findFirst({
    where: {
      productId: productId,
      userId: session?.user?.id,
    },
  });
}
