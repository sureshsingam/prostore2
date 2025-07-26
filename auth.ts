import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";

import { cookies } from "next/headers";
import { authConfig } from "./auth.config";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials === null) return null;
        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        //check if user exists and if the password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // If User does not exist or password does not match return null
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      //Set the user ID from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      //if there is an update, set the user name
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      // Assign user fields to token only if user exists (during initial sign-in)
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // if user has no name then use the email
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          // update the database to reflect the token name
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { name: token.name },
            });
          } catch (error) {
            console.error("Failed to update user name:", error);
            // Continue with token creation even if DB update fails
          }
        }
        // checks if the trigger is sign in or sign up
        if (trigger === "signIn" || trigger === "signUp") {
          // Handle cart persistence with error handling to prevent auth failures
          try {
            // get session cart ID from cookie
            const cookiesObject = await cookies();
            const sessionCartId = cookiesObject.get("sessionCartId")?.value;
            if (sessionCartId) {
              //get cart from database
              const sessionCart = await prisma.cart.findFirst({
                where: { sessionCartId: sessionCartId },
              });

              if (sessionCart) {
                //override any user cart
                await prisma.cart.deleteMany({
                  where: { userId: user.id },
                });

                // Verify cart still exists before update (prevents race condition)
                const cartExists = await prisma.cart.findUnique({
                  where: { id: sessionCart.id },
                });

                if (cartExists) {
                  // assign new cart
                  await prisma.cart.update({
                    where: { id: sessionCart.id },
                    data: { userId: user.id },
                  });
                } else {
                  console.warn(
                    `Cart ${sessionCart.id} no longer exists, skipping cart transfer`
                  );
                }
              }
            }
          } catch (error) {
            // Log error but don't break authentication
            console.error("Cart transfer failed during authentication:", error);
            console.error("Authentication will continue without cart transfer");
          }
        }
      }

      // Handle Session updates
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      // During token refresh, user will be undefined, so we preserve existing token data
      return token;
    },
    ...authConfig.callbacks,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
