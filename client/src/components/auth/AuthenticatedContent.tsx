"use client";

interface AuthenticatedContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthenticatedContent({ children, fallback }: AuthenticatedContentProps) {
  return <>{children}</>;
}
