"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type Slot = {
  id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export default function SlotList({ slots }: { slots: Slot[] }) {
  const router = useRouter()

  const handleDelete = async (slotId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("availability_slots").delete().eq("id", slotId)
      if (error) {
        throw error
      }

      toast.success("Slot removed.")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">No availability defined.</p>
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              {slot.date} {slot.start_time} – {slot.end_time}
            </p>
            <p className="text-xs text-muted-foreground">
              {slot.is_booked ? "Booked" : "Available"}
            </p>
          </div>
          <Button variant="outline" size="xs" onClick={() => handleDelete(slot.id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  )
}
