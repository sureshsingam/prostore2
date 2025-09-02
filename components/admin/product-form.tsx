"use client";

import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";
import slugify from "slugify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { useState } from "react";
import React from "react";
import { Checkbox } from "../ui/checkbox";

// Utility function to validate and return safe image URLs
const getValidImageSrc = (
  url: string | null | undefined,
  fallback: string = "/images/placeholder.svg"
): string => {
  if (!url || url.trim() === "") return fallback;
  try {
    new URL(url);
    return url;
  } catch {
    return url.startsWith("/") && url.length > 1 ? url : fallback;
  }
};

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver: zodResolver(
      type === "Create" ? insertProductSchema : updateProductSchema
    ),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  // Cleanup timeout on component unmount
  React.useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
    };
  }, [uploadTimeout]);

  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values
  ) => {
    if (type === "Create") {
      const res = await createProduct(values);
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
      }
      router.push("/admin/products");
    }

    //on Update
    if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }

      const res = await updateProduct({ ...values, id: productId });
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
      }
      router.push("/admin/products");
    }
  };

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-5">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel> Name </FormLabel>
                <FormControl>
                  <Input placeholder="Enter Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "slug"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel> Slug </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2 cursor-pointer"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          {/* category */}
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "category"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel> Category </FormLabel>
                <FormControl>
                  <Input placeholder="Enter Category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "brand"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel> Brand </FormLabel>
                <FormControl>
                  <Input placeholder="Enter Brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "price"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel> Price </FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Stock */}

          <FormField
            control={form.control}
            name="stock"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "stock"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel> Stock </FormLabel>
                <FormControl>
                  <Input placeholder="Enter stock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field flex flex-col md:flex-row gap-5">
          {/* Images */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel> Images </FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 min-h-48">
                    <div className="flex-start space-x-2">
                      {images && images.length > 0 ? (
                        images.map((image: string) => (
                          <Image
                            key={image}
                            src={getValidImageSrc(image)}
                            alt="product image"
                            className="w-20 h-20 object-cover object-center rounded-sm"
                            width={100}
                            height={100}
                          />
                        ))
                      ) : (
                        <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-sm">
                          <span className="text-xs text-gray-500">
                            No images
                          </span>
                        </div>
                      )}
                      <FormControl>
                        <UploadButton
                          endpoint="imageUploader"
                          onUploadBegin={() => {
                            setIsUploading(true);
                            setUploadProgress(0);
                            toast.info("Starting upload...");

                            // Set upload timeout (30 seconds)
                            const timeout = setTimeout(() => {
                              setIsUploading(false);
                              setUploadProgress(0);
                              toast.error(
                                "Upload timeout - please try again with a smaller file"
                              );
                            }, 30000);
                            setUploadTimeout(timeout);
                          }}
                          onUploadProgress={(progress) => {
                            setUploadProgress(progress);
                            if (progress === 100) {
                              toast.info("Processing upload...");
                            }
                          }}
                          onClientUploadComplete={(res: { url: string }[]) => {
                            if (uploadTimeout) {
                              clearTimeout(uploadTimeout);
                              setUploadTimeout(null);
                            }

                            if (res && res[0]?.url) {
                              form.setValue("images", [...images, res[0].url]);
                              setIsUploading(false);
                              setUploadProgress(100);
                              toast.success("Image uploaded successfully!");
                            } else {
                              setIsUploading(false);
                              setUploadProgress(0);
                              toast.error(
                                "Upload completed but no file URL received"
                              );
                            }
                          }}
                          onUploadError={(error) => {
                            if (uploadTimeout) {
                              clearTimeout(uploadTimeout);
                              setUploadTimeout(null);
                            }

                            setIsUploading(false);
                            setUploadProgress(0);

                            const errorMessage =
                              error.message || "Unknown upload error";
                            console.error("Upload error:", error);
                            toast.error(`Upload failed: ${errorMessage}`);
                          }}
                          appearance={{
                            button: isUploading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700",
                            allowedContent: "text-sm text-gray-600",
                          }}
                          content={{
                            button: isUploading
                              ? `Uploading... ${uploadProgress}%`
                              : "Choose File",
                            allowedContent: "Image (4MB max)",
                          }}
                        />
                      </FormControl>
                      {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {/* isFeatured */}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Product</FormLabel>
                <Card>
                  <CardContent className="space-y-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Is Featured ?
                      </FormLabel>
                    </div>

                    {isFeatured && (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          Featured products require a banner image for display
                          on the homepage.
                        </div>

                        {banner && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              Current Banner:
                            </div>
                            <div className="relative">
                              <Image
                                src={getValidImageSrc(banner)}
                                alt="banner image"
                                className="w-full max-w-md object-cover object-center rounded-sm border"
                                width={400}
                                height={200}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  form.setValue("banner", null);
                                  toast.success("Banner removed");
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}

                        {!banner && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              Upload Banner Image:
                            </div>
                            <UploadButton
                              endpoint="imageUploader"
                              onUploadBegin={() => {
                                setIsUploading(true);
                                setUploadProgress(0);
                                toast.info("Starting banner upload...");

                                // Set upload timeout (30 seconds)
                                const timeout = setTimeout(() => {
                                  setIsUploading(false);
                                  setUploadProgress(0);
                                  toast.error(
                                    "Upload timeout - please try again with a smaller file"
                                  );
                                }, 30000);
                                setUploadTimeout(timeout);
                              }}
                              onUploadProgress={(progress) => {
                                setUploadProgress(progress);
                                if (progress === 100) {
                                  toast.info("Processing banner upload...");
                                }
                              }}
                              onClientUploadComplete={(
                                res: { url: string }[]
                              ) => {
                                if (uploadTimeout) {
                                  clearTimeout(uploadTimeout);
                                  setUploadTimeout(null);
                                }

                                if (res && res[0]?.url) {
                                  form.setValue("banner", res[0].url);
                                  setIsUploading(false);
                                  setUploadProgress(100);
                                  toast.success(
                                    "Banner uploaded successfully!"
                                  );
                                } else {
                                  setIsUploading(false);
                                  setUploadProgress(0);
                                  toast.error(
                                    "Upload completed but no file URL received"
                                  );
                                }
                              }}
                              onUploadError={(error) => {
                                if (uploadTimeout) {
                                  clearTimeout(uploadTimeout);
                                  setUploadTimeout(null);
                                }

                                setIsUploading(false);
                                setUploadProgress(0);

                                const errorMessage =
                                  error.message || "Unknown upload error";
                                console.error("Upload error:", error);
                                toast.error(`Upload failed: ${errorMessage}`);
                              }}
                              appearance={{
                                button: isUploading
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700",
                                allowedContent: "text-sm text-gray-600",
                              }}
                              content={{
                                button: isUploading
                                  ? `Uploading Banner... ${uploadProgress}%`
                                  : "Choose Banner Image",
                                allowedContent: "Banner Image (4MB max)",
                              }}
                            />
                            {isUploading && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        )}

                        {banner && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              Replace Banner Image:
                            </div>
                            <UploadButton
                              endpoint="imageUploader"
                              onUploadBegin={() => {
                                setIsUploading(true);
                                setUploadProgress(0);
                                toast.info("Starting banner upload...");

                                // Set upload timeout (30 seconds)
                                const timeout = setTimeout(() => {
                                  setIsUploading(false);
                                  setUploadProgress(0);
                                  toast.error(
                                    "Upload timeout - please try again with a smaller file"
                                  );
                                }, 30000);
                                setUploadTimeout(timeout);
                              }}
                              onUploadProgress={(progress) => {
                                setUploadProgress(progress);
                                if (progress === 100) {
                                  toast.info("Processing banner upload...");
                                }
                              }}
                              onClientUploadComplete={(
                                res: { url: string }[]
                              ) => {
                                if (uploadTimeout) {
                                  clearTimeout(uploadTimeout);
                                  setUploadTimeout(null);
                                }

                                if (res && res[0]?.url) {
                                  form.setValue("banner", res[0].url);
                                  setIsUploading(false);
                                  setUploadProgress(100);
                                  toast.success("Banner updated successfully!");
                                } else {
                                  setIsUploading(false);
                                  setUploadProgress(0);
                                  toast.error(
                                    "Upload completed but no file URL received"
                                  );
                                }
                              }}
                              onUploadError={(error) => {
                                if (uploadTimeout) {
                                  clearTimeout(uploadTimeout);
                                  setUploadTimeout(null);
                                }

                                setIsUploading(false);
                                setUploadProgress(0);

                                const errorMessage =
                                  error.message || "Unknown upload error";
                                console.error("Upload error:", error);
                                toast.error(`Upload failed: ${errorMessage}`);
                              }}
                              appearance={{
                                button: isUploading
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700",
                                allowedContent: "text-sm text-gray-600",
                              }}
                              content={{
                                button: isUploading
                                  ? `Uploading... ${uploadProgress}%`
                                  : "Replace Banner",
                                allowedContent: "New Banner Image (4MB max)",
                              }}
                            />
                            {isUploading && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "description"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel> Description </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter Product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting || isUploading}
            className="button col-span-2 w-full cursor-pointer"
          >
            {isUploading
              ? "Uploading..."
              : form.formState.isSubmitting
              ? "Submitting..."
              : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
