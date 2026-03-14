"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type FormValues = {
  date: string
  startTime: string
  endTime: string
}

export default function AddSlotForm({ providerId }: { providerId: string }) {
  const router = useRouter()
  const { register, handleSubmit, reset } = useForm<FormValues>()

  const onSubmit = async (values: FormValues) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("availability_slots").insert({
        provider_id: providerId,
        date: values.date,
        start_time: values.startTime,
        end_time: values.endTime,
      })

      if (error) {
        throw error
      }

      toast.success("Slot added.")
      reset()
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium text-foreground">Date</label>
        <input
          type="date"
          className="w-full rounded-lg border border-input px-3 py-2"
          {...register("date", { required: true })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Start time</label>
        <input
          type="time"
          className="w-full rounded-lg border border-input px-3 py-2"
          {...register("startTime", { required: true })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">End time</label>
        <input
          type="time"
          className="w-full rounded-lg border border-input px-3 py-2"
          {...register("endTime", { required: true })}
        />
      </div>
      <Button type="submit">Add slot</Button>
    </form>
  )
}
