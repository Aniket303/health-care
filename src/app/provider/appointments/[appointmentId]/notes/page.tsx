import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import NoteForm from "@/components/note-form"

export default async function AppointmentNotePage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/provider/appointments")
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, scheduled_at, patient_id, provider_id")
    .eq("id", appointmentId)
    .eq("provider_id", user.id)
    .maybeSingle()

  if (!appointment) {
    redirect("/provider/appointments")
  }

  const { data: existingNote } = await supabase
    .from("clinical_notes")
    .select("id")
    .eq("appointment_id", appointmentId)
    .eq("provider_id", user.id)
    .maybeSingle()

  if (existingNote) {
    redirect(`/provider/notes/${existingNote.id}`)
  }

  const { data: patient } = appointment.patient_id
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", appointment.patient_id)
        .maybeSingle()
    : { data: null }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Clinical</p>
        <h1 className="text-3xl font-semibold text-foreground">New SOAP Note</h1>
        {patient && (
          <p className="text-muted-foreground mt-1">Patient: {patient.full_name}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Appointment: {new Date(appointment.scheduled_at).toLocaleString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SOAP Note</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteForm
            appointmentId={appointmentId}
            providerId={user.id}
            patientId={appointment.patient_id ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  )
}
