import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import NoteForm from "@/components/note-form"

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ noteId: string }>
}) {
  const { noteId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/provider/notes")
  }

  const { data: note } = await supabase
    .from("clinical_notes")
    .select("id, subjective, objective, assessment, plan, appointment_id, patient_id, provider_id")
    .eq("id", noteId)
    .eq("provider_id", user.id)
    .maybeSingle()

  if (!note) {
    redirect("/provider/notes")
  }

  const { data: appointment } = note.appointment_id
    ? await supabase
        .from("appointments")
        .select("id, scheduled_at, patient_id")
        .eq("id", note.appointment_id)
        .maybeSingle()
    : { data: null }

  const patientId = note.patient_id ?? appointment?.patient_id ?? ""

  const { data: patient } = patientId
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", patientId)
        .maybeSingle()
    : { data: null }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Clinical</p>
        <h1 className="text-3xl font-semibold text-foreground">Edit SOAP Note</h1>
        {patient && (
          <p className="text-muted-foreground mt-1">Patient: {patient.full_name}</p>
        )}
        {appointment && (
          <p className="text-sm text-muted-foreground">
            Appointment: {new Date(appointment.scheduled_at).toLocaleString()}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SOAP Note</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteForm
            appointmentId={note.appointment_id ?? ""}
            providerId={user.id}
            patientId={patientId}
            note={{
              id: note.id,
              subjective: note.subjective,
              objective: note.objective,
              assessment: note.assessment,
              plan: note.plan,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
