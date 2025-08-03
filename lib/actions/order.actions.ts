"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { getUserById } from "./user.actions";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { insertOrderSchema } from "../validators";

// Create Order and Order Items

export async function createOrder() {
  try {
    //get session
    const session = await auth();
    if (!session) {
      throw new Error("User is Not authenticated");
    }
    const cart = await getMyCart();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not found");
    }
    const user = await getUserById(userId);
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "No Shipping Address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No Payment Method",
        redirectTo: "/payment-method",
      };
    }

    // validate data with zod schema
    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // create a transaction to create order and order item in the database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create Order
      const insertedOrder = await tx.order.create({ data: order });
      // create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            productId: item.productId,
            name: item.name,
            slug: item.slug,
            image: item.image,
            price: item.price,
            quantity: item.qty, // Map qty to quantity
            orderId: insertedOrder.id,
          },
        });
      }
      // clear cart in db, and set prices in db for cart to 0
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });
      return insertedOrder.id;
    });
    if (!insertedOrderId) {
      throw new Error("Order not created");
    }
    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      success: false,
      message: formatErrors(error),
    };
  }
}

//get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });

  return convertToPlainObject(data);
}
