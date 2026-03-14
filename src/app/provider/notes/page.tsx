import Link from "next/link"
import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function ProviderNotesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/provider/notes")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/auth/setup-profile")
  }

  const { data: notes } = await supabase
    .from("clinical_notes")
    .select("id, subjective, objective, assessment, plan, appointment_id, patient_id")
    .eq("provider_id", profile.id)
    .order("created_at", { ascending: false })

  const patientIds = Array.from(
    new Set(notes?.map((n) => n.patient_id).filter(Boolean)),
  )

  const { data: patientProfiles } =
    patientIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", patientIds)
      : { data: [] }

  const patientMap = new Map(
    patientProfiles?.map((p) => [p.id, p]) ?? [],
  )

  const appointmentIds = Array.from(
    new Set(notes?.map((n) => n.appointment_id).filter(Boolean)),
  )

  const { data: appointments } =
    appointmentIds.length > 0
      ? await supabase
          .from("appointments")
          .select("id, scheduled_at")
          .in("id", appointmentIds)
      : { data: [] }

  const appointmentMap = new Map(
    appointments?.map((a) => [a.id, a]) ?? [],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Clinical</p>
          <h1 className="text-3xl font-semibold text-foreground">SOAP Notes</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/provider/appointments">
            <Button variant="outline">New Note (via Appointment)</Button>
          </Link>
          <Link href="/provider">
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(notes?.length ?? 0) === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">No notes yet.</p>
              <p className="text-sm text-muted-foreground">
                To create a note, go to{" "}
                <Link href="/provider/appointments" className="underline">
                  Appointments
                </Link>{" "}
                and click &quot;Add Note&quot; on an appointment.
              </p>
            </div>
          ) : (
            notes?.map((note) => {
              const patient = patientMap.get(note.patient_id ?? "")
              const appointment = appointmentMap.get(note.appointment_id ?? "")
              const preview = note.subjective?.slice(0, 80) ?? ""
              return (
                <div
                  key={note.id}
                  className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {patient?.full_name ?? "Patient"}
                      </p>
                      {appointment && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduled_at).toLocaleString()}
                        </p>
                      )}
                      {preview && (
                        <p className="text-sm text-muted-foreground mt-1">
                          S: {preview}{note.subjective && note.subjective.length > 80 ? "…" : ""}
                        </p>
                      )}
                    </div>
                    <Link href={`/provider/notes/${note.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
