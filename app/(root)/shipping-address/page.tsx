import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.action";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShippingAddress } from "@/types";

export const metadata: Metadata = {
  title: "Shipping Address",
};

const ShippingAddressPage = async () => {
  // get cart
  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  // get session
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("No user ID");

  //get user from database using the user id from the session
  const user = await getUserById(userId);

  return <> Address</>;
};

export default ShippingAddressPage;
