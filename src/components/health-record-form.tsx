"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type FormValues = {
  allergies: string        // comma-separated string in the form
  current_medications: string  // comma-separated string in the form
  medical_history: string
}

type Props = {
  patientId: string
  record: {
    allergies: string[] | null
    current_medications: string[] | null
    medical_history: string | null
  }
}

export default function HealthRecordForm({ patientId, record }: Props) {
  const router = useRouter()
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      allergies: record.allergies?.join(", ") ?? "",
      current_medications: record.current_medications?.join(", ") ?? "",
      medical_history: record.medical_history ?? "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("patients")
        .update({
          allergies: values.allergies
            ? values.allergies.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          current_medications: values.current_medications
            ? values.current_medications.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          medical_history: values.medical_history,
        })
        .eq("id", patientId)

      if (error) throw error

      toast.success("Health record updated.")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium text-foreground">
          Allergies <span className="text-muted-foreground font-normal">(comma-separated)</span>
        </label>
        <textarea
          rows={2}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
          placeholder="e.g. Penicillin, Peanuts, Latex"
          {...register("allergies")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">
          Current Medications <span className="text-muted-foreground font-normal">(comma-separated)</span>
        </label>
        <textarea
          rows={2}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
          placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
          {...register("current_medications")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Medical History</label>
        <textarea
          rows={5}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
          placeholder="Past diagnoses, surgeries, chronic conditions..."
          {...register("medical_history")}
        />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  )
}