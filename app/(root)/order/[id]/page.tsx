import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";

import Stripe from "stripe";

export const metadata: Metadata = {
  title: "Order Details Page",
};
const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;
  const order = await getOrderById(id);
  if (!order) {
    notFound();
  }

  const session = await auth();

  //initialize Client secret for stripe
  let client_secret: string | null = null;

  // check if order is not paid and using stripe
  if (!order.isPaid && order.paymentMethod === "Stripe") {
    // initialize stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    // create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "CAD",
      metadata: {
        orderId: order.id,
      },
    });
    client_secret = paymentIntent.client_secret;
  }

  return (
    <>
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        stripeClientSecret={client_secret || ""}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
        isAdmin={session?.user?.role === "admin" || false}
      />
    </>
  );
};

export default OrderDetailsPage;
