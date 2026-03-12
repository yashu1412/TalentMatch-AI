"use client";

import { useState, useEffect } from "react";
import { Show } from "@clerk/nextjs";

interface AuthenticatedContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthenticatedContent({ children, fallback }: AuthenticatedContentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback || null}</>;
  }

  return (
    <Show when="signed-in" fallback={fallback}>
      {children}
    </Show>
  );
}
