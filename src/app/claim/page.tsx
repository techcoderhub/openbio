import Link from "next/link";

import { Button } from "@/components/ui/button";
import ClaimLinkForm from "@/components/forms/claim-link";
import HomeIcon from "@/components/home-icon";

export default function Page() {
  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center justify-center">
      <HomeIcon />

      <h1 className="font-cal text-3xl md:text-5xl">
        Claim your unique profile page
      </h1>
      <p className="mt-4 text-muted-foreground">
        It is free and takes less than 2 minutes. You can then add your
        information, links, and more.
      </p>

      <ClaimLinkForm className="mt-12" />

      <Link href="/sign-in" className="mt-12 self-start md:self-auto">
        <Button variant="link" className="px-0">
          or sign in
        </Button>
      </Link>
    </div>
  );
}