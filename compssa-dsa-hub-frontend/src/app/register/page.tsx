"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Users } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
            Join CompSSA DSA Hub
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm md:text-base">
            Account registration is managed by the CompSSA team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-foreground">
              To create an account on the CompSSA DSA Hub, please contact the
              team heads. They will help you set up your account and get you
              started.
            </p>
            <p className="text-xs text-muted-foreground">
              Please include your name, student ID, and preferred username in
              your email.
            </p>
          </div>

          <Button asChild className="w-full gap-2">
            <a href="mailto:ziglacity@gmail.com?subject=CompSSA DSA Hub Account Request&body=Hi,%0A%0AI would like to request an account on the CompSSA DSA Hub.%0A%0AName: %0AStudent ID: %0APreferred Username: %0A%0AThank you!">
              <Mail className="w-4 h-4" />
              Contact Team Heads
            </a>
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
