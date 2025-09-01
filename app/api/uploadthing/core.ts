import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 4,
    },
  })
    .middleware(async () => {
      try {
        const session = await auth();

        if (!session?.user?.id) {
          throw new UploadThingError("Unauthorized - Please sign in");
        }

        return { userId: session.user.id };
      } catch (error) {
        console.error("Upload middleware error:", error);
        throw new UploadThingError("Authentication failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload completed:", {
          userId: metadata.userId,
          fileUrl: file.ufsUrl,
          fileName: file.name,
          fileSize: file.size,
        });

        return {
          uploadedBy: metadata.userId,
          fileUrl: file.ufsUrl,
        };
      } catch (error) {
        console.error("Upload completion error:", error);
        return { uploadedBy: metadata.userId };
      }
    }),
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;
