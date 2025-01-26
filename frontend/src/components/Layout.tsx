import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export const Layout: React.FC = () => {
  // Handle layout-specific logic here
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">unpack.ai</span>
          </div>
          <nav className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            </SignedIn>
          </nav>
        </div>
      </header>
      <main className="container mx-auto mt-14">
        <Toaster />
        <Sonner />
        <Outlet />
      </main>
    </>
  );
};

export default Layout;