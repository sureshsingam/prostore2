"use server";
// import { PrismaClient } from "../generated/prisma";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
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
