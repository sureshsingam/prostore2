"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Cart, CartItem } from "@/types";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.action";
import { toast } from "sonner";
import { Plus, Minus, Loader } from "lucide-react";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      // deal with response,
      if (!res.success) {
        toast.error(res.message); // Changed to use toast.error (dot notation)
        return;
      }
      //Handle success add to cart
      toast.success(res.message, {
        action: {
          label: "Go to Cart",
          onClick: () => router.push("/cart"),
        },
      });
    });
  };

  // handle remove from Cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      // deal with response,
      if (!res.success) {
        toast.error(res.message); // Changed to use toast.error (dot notation)
        return;
      }
      //Handle success add to cart
      toast.success(res.message, {
        action: {
          label: "Go to Cart",
          onClick: () => router.push("/cart"),
        },
      });
      return;
    });
  };

  // Check if item is in Cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Minus className="h-4 w-4"> </Minus>
        )}
      </Button>
      <span className="px-2"> {existItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        {isPending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  ) : (
    <Button
      className="w-full cursor-pointer bg-primary text-white hover:bg-gray-800"
      type="button"
      onClick={handleAddToCart}
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Add To Cart
    </Button>
  );
};

export default AddToCart;
