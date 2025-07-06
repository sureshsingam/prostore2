import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { APP_NAME } from "@/lib/constants";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CredentialsSignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
};

const SignUpPage = async (props: {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}) => {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl || "/";
  const session = await auth();

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/images/logo.svg"
              alt={`${APP_NAME}`}
              width={100}
              height={100}
              priority={true}
            />
          </Link>
          <CardTitle className="text-center"> Create Account </CardTitle>
          <CardDescription className="text-center">
            Enter your information below to signup
          </CardDescription>
          <CardContent className="space-y-4">
            <CredentialsSignUpForm />
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SignUpPage;
