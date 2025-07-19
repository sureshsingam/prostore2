"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types";
import { addItemToCart } from "@/lib/actions/cart.action";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);

    // deal with response,
    if (!res.success) {
      toast.error(res.message); // Changed to use toast.error (dot notation)
      return;
    }
    //Handle success add to cart
    toast.success(`${item.name} added to cart`, {
      action: {
        label: "Go to Cart",
        onClick: () => router.push("/cart"),
      },
    });
  };
  return (
    <>
      <Button
        className="w-full cursor-pointer bg-primary text-white hover:bg-gray-800"
        type="button"
        onClick={handleAddToCart}
      >
        <Plus /> Add To Cart
      </Button>
    </>
  );
};

export default AddToCart;
