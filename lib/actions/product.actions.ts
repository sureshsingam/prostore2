"use server";
// import { PrismaClient } from "../generated/prisma";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatErrors } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
// Get latest products

export async function getLatestProducts() {
  // const prisma = new PrismaClient();
  let data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });
  data = convertToPlainObject(data);

  return data;
}

// get Single Product by its slug

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  });
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
}) {
  const data = await prisma.product.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
  const dataCount = await prisma.product.count();
  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete Product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id: id },
    });
    if (!productExists) {
      throw new Error("Product not found");
    }
    await prisma.product.delete({
      where: { id: id },
    });
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}
