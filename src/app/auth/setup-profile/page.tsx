"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

type SetupProfileForm = {
  full_name: string
  phone: string
}

export default function SetupProfilePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<SetupProfileForm>({
    defaultValues: { full_name: "", phone: "" },
  })

  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        toast.error("Sign in to continue.")
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error(profileError)
      }

      if (profile && isMounted) {
        reset({
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
        })
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [reset, router, supabase])

  const onSubmit = async (values: SetupProfileForm) => {
    if (!userId) {
      toast.error("Unable to update profile.")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          phone: values.phone,
        })
        .eq("id", userId)
        .select("role")
        .maybeSingle()

      if (error) {
        throw error
      }

      const redirectTo = data?.role === "provider" ? "/provider" : "/patient"
      router.push(redirectTo)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading profile…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/70 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lg">
        <h1 className="mb-4 text-3xl font-semibold text-foreground">Complete your profile</h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              placeholder="Jane Doe"
              {...register("full_name", { required: "Full name is required." })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 012-3456"
              {...register("phone", { required: "Phone number is required." })}
            />
          </div>
          <Button type="submit" className="w-full">
            Save and continue
          </Button>
        </form>
      </div>
    </div>
  )
}
