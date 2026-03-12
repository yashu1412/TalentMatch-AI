"use client";

import { useState, useEffect } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function AuthButtons() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return placeholder that matches server HTML
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-20 rounded-xl border border-primary-light/30 bg-gradient-to-r from-primary-dark via-primary to-primary-glow animate-pulse" />
        <div className="h-10 w-20 rounded-xl border border-white/20 bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-xl border border-primary-light/30 bg-gradient-to-r from-primary-dark via-primary to-primary-glow px-4 py-2 text-sm font-medium text-white shadow-blue transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-text-primary transition-all duration-300 hover:border-primary-glow/20 hover:bg-white/10">
            Sign Up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 rounded-xl border border-primary-glow/20",
              userButtonPopoverCard: "border border-white/10 bg-black/80 backdrop-blur-xl",
              userButtonPopoverActionButton: "text-text-primary hover:bg-white/5"
            }
          }}
        />
      </Show>
    </div>
  );
}
