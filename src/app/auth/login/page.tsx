"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { Heart, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

type LoginFormValues = {
  email: string
  password: string
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit } = useForm<LoginFormValues>()

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        throw error
      }

      const user = data.user
      if (!user) {
        throw new Error("Unable to retrieve user after login.")
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      const nextParam = searchParams.get("next")
      const redirectPath =
        nextParam ?? (profile?.role === "provider" ? "/provider" : "/patient")

      router.push(redirectPath)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(22,163,74,0.12),transparent_35%),linear-gradient(180deg,#fcfdfc_0%,#f5f8f6_100%)]">
      {/* Header */}
      <div className="px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-green-600" />
          <span className="text-xl font-bold text-foreground">HealthCare</span>
        </Link>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Welcome back indicator */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <LogIn className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your healthcare dashboard
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  className="mt-2 h-12"
                  {...register("email", { required: "Email is required." })}
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 h-12"
                  {...register("password", { required: "Password is required." })}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-medium" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-green-600 hover:text-green-700 font-medium">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Secure login protected by enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
