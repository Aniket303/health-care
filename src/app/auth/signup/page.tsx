'use client'

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { Heart, Users, Stethoscope } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

type SignupForm = {
  email: string
  password: string
  role: "patient" | "provider"
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupPageFallback />}>
      <SignupForm />
    </Suspense>
  )
}

function SignupPageFallback() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(22,163,74,0.12),transparent_35%),linear-gradient(180deg,#fcfdfc_0%,#f5f8f6_100%)] flex items-center justify-center">
      <div className="text-center">
        <Heart className="h-8 w-8 text-green-600 mx-auto animate-pulse" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get role from URL parameters
  const roleParam = searchParams.get('role')
  const initialRole = (roleParam === 'provider' || roleParam === 'patient') ? roleParam : 'patient'
  
  const { register, handleSubmit, setValue } = useForm<SignupForm>({
    defaultValues: { role: initialRole },
  })

  // Update form when URL parameter changes
  useEffect(() => {
    setValue('role', initialRole)
  }, [initialRole, setValue])

  const onSubmit = async (values: SignupForm) => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role: values.role,
          },
        },
      })

      if (error) {
        throw error
      }

      router.push("/auth/setup-profile")
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
          {/* Role indicator */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              {initialRole === 'provider' ? (
                <Stethoscope className="h-8 w-8 text-green-600" />
              ) : (
                <Users className="h-8 w-8 text-green-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {initialRole === 'provider' ? 'Join as Provider' : 'Start as Patient'}
            </h1>
            <p className="text-muted-foreground">
              {initialRole === 'provider' 
                ? 'Help patients get the care they need'
                : 'Get connected with healthcare providers'
              }
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
                  placeholder="Create a strong password"
                  className="mt-2 h-12"
                  {...register("password", { required: "Password is required." })}
                />
              </div>
              
              <div>
                <Label htmlFor="role" className="text-sm font-medium">I am a</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    initialRole === 'patient' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-border hover:border-green-200'
                  }`}>
                    <input
                      type="radio"
                      value="patient"
                      className="sr-only"
                      {...register("role", { required: true })}
                    />
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Patient</span>
                  </label>
                  
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    initialRole === 'provider' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-border hover:border-green-200'
                  }`}>
                    <input
                      type="radio"
                      value="provider"
                      className="sr-only"
                      {...register("role", { required: true })}
                    />
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-sm font-medium">Provider</span>
                  </label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-medium" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account…" : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy. 
              Your data is protected with enterprise-grade security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
