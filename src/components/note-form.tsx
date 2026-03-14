"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type FormValues = {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

type Props = {
  appointmentId: string
  providerId: string
  patientId: string
  note?: {
    id: string
    subjective: string | null
    objective: string | null
    assessment: string | null
    plan: string | null
  }
}

export default function NoteForm({ appointmentId, providerId, patientId, note }: Props) {
  const router = useRouter()
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      subjective: note?.subjective ?? "",
      objective: note?.objective ?? "",
      assessment: note?.assessment ?? "",
      plan: note?.plan ?? "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const supabase = createClient()

      if (note?.id) {
        const { error } = await supabase
          .from("clinical_notes")
          .update({
            subjective: values.subjective,
            objective: values.objective,
            assessment: values.assessment,
            plan: values.plan,
          })
          .eq("id", note.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("clinical_notes").insert({
          appointment_id: appointmentId,
          provider_id: providerId,
          patient_id: patientId,
          subjective: values.subjective,
          objective: values.objective,
          assessment: values.assessment,
          plan: values.plan,
        })

        if (error) throw error
      }

      toast.success("Note saved.")
      router.push("/provider/notes")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium text-foreground">Subjective</label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
          placeholder="Patient's chief complaint and history..."
          {...register("subjective")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Objective</label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
          placeholder="Examination findings and vitals..."
          {...register("objective")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Assessment</label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
          placeholder="Diagnosis and clinical impression..."
          {...register("assessment")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">Plan</label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-input px-3 py-2 text-sm"
          placeholder="Treatment plan and follow-up..."
          {...register("plan")}
        />
      </div>
      <Button type="submit">{note?.id ? "Update note" : "Save note"}</Button>
    </form>
  )
}
