"use client";

import Image from "next/image";
import { useState } from "react";

const ProductImages = ({ images }: { images: string[] }) => {
  //   console.log(images);
  const [current, setCurrent] = useState(0);

  // Handle empty or invalid images array
  const validImages =
    images && images.length > 0 ? images : ["/images/placeholder.svg"];
  const safeCurrentIndex = current < validImages.length ? current : 0;

  return (
    <div className="space-y-4 ">
      <Image
        src={validImages[safeCurrentIndex]}
        alt="product image"
        width={1000}
        height={1000}
        className="min-h-[300px] object-cover object-center cursor-pointer border-2 hover:border-amber-500"
      />
      <div className="flex">
        {validImages.map((image, index) => (
          <div
            key={image}
            onClick={() => setCurrent(index)}
            className={
              safeCurrentIndex === index
                ? "border-2 border-amber-500 cursor-pointer"
                : "hover:border-2 cursor-pointer"
            }
          >
            <Image src={image} alt={image} width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
