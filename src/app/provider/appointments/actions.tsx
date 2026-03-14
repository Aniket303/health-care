"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function ProviderAppointmentActions({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string
  currentStatus: string
}) {
  const router = useRouter()

  const updateStatus = async (status: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("appointments").update({ status }).eq("id", appointmentId)
      if (error) {
        throw error
      }

      toast.success("Status updated.")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== "confirmed" && currentStatus !== "completed" && currentStatus !== "cancelled" && (
        <Button size="xs" onClick={() => updateStatus("confirmed")}>
          Confirm
        </Button>
      )}
      {(currentStatus === "confirmed" || currentStatus === "scheduled") && (
        <Button size="xs" onClick={() => updateStatus("completed")}>
          Mark Complete
        </Button>
      )}
      {currentStatus !== "cancelled" && currentStatus !== "completed" && (
        <Button size="xs" variant="outline" onClick={() => updateStatus("cancelled")}>
          Cancel
        </Button>
      )}
    </div>
  )
}
