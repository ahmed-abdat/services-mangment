"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Header() {
  const router = useRouter();

  const handleSignOut = () => {
    try {
      // Remove user from localStorage
      localStorage.removeItem("user");
      // Redirect to home page
      router.push("/");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  return (
    <header className="border-b top-0 bg-white xl:sticky">
      <nav className="pt-1.5 flex items-center justify-between flex-wrap text-sm sm:flex-nowrap custom-screen-xl">
        <div>
          <Link href="/services" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              width={50}
              height={50}
              alt="RIMcode logo"
              priority={true}
            />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gray-900">
                RIMcode
              </span>
              <span className="text-sm text-gray-600">Services Dashboard</span>
            </div>
          </Link>
        </div>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </nav>
    </header>
  );
}
