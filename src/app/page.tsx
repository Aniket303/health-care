import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(22,163,74,0.12),transparent_35%),linear-gradient(180deg,#fcfdfc_0%,#f5f8f6_100%)] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-4">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Step 1 complete
          </Badge>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get started</Button>
            </Link>
          </div>
          <div className="space-y-3">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
              Virtual health platform scaffolded with Next.js, Supabase, Tailwind, and shadcn/ui.
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
              The project is ready for database setup, auth wiring, onboarding, scheduling, and provider workflows.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Foundation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              App Router, TypeScript, Tailwind v4, ESLint, and the base component registry are in place.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Supabase Ready</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Browser and server client helpers are wired, with middleware ready to refresh sessions.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Protected Routes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Requests to patient and provider areas will redirect to login when unauthenticated.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
