"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useState } from "react"

export function LogoutButton() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSignOut = async () => {
    setIsProcessing(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="xs"
      onClick={handleSignOut}
      disabled={isProcessing}
      className="px-3"
    >
      Log out
    </Button>
  )
}
