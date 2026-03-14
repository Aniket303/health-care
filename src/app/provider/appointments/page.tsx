import Link from "next/link"
import { redirect } from "next/navigation"

import { AppointmentStatusBadge } from "@/components/appointment-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import ProviderAppointmentActions from "./actions"

export default async function ProviderAppointmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/provider/appointments")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/auth/setup-profile")
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, type, patient_id")
    .eq("provider_id", profile.id)
    .order("scheduled_at", { ascending: false })

  const patientIds = Array.from(
    new Set(appointments?.map((appointment) => appointment.patient_id).filter(Boolean)),
  )

  const { data: patientProfiles } =
    patientIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", patientIds)
      : { data: [] }

  const patientMap = new Map(
    patientProfiles?.map((patient) => [patient.id, patient]) ?? [],
  )

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Appointments</p>
        <h1 className="text-3xl font-semibold text-foreground">Manage your calendar</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(appointments?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments yet.</p>
          ) : (
            appointments?.map((appointment) => {
              const patient = patientMap.get(appointment.patient_id ?? "")
              const date = new Date(appointment.scheduled_at)
              return (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {patient?.full_name ?? "Patient"}
                      </p>
                      <p className="text-sm text-muted-foreground">{date.toLocaleString()}</p>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{appointment.type}</p>
                    <div className="flex items-center gap-2">
                      <ProviderAppointmentActions appointmentId={appointment.id} currentStatus={appointment.status} />
                      <Link href={`/provider/patients/${appointment.patient_id}`}>
                        <Button variant="ghost" size="sm">View Record</Button>
                      </Link>
                      <Link href={`/provider/messages/${appointment.patient_id}`}>
                        <Button variant="ghost" size="sm">Message</Button>
                      </Link>
                      <Link href={`/provider/appointments/${appointment.id}/notes`}>
                        <Button variant="outline" size="sm">Add Note</Button>
                      </Link>
                    </div>
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
