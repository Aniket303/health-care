import Link from "next/link"

import { AppointmentStatusBadge } from "@/components/appointment-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"

export default async function PatientAppointmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sign in to view your appointments.</p>
        </CardContent>
      </Card>
    )
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, type, provider_id")
    .eq("patient_id", user.id)
    .order("scheduled_at", { ascending: false })

  const providerIds = Array.from(
    new Set(appointments?.map((appointment) => appointment.provider_id).filter(Boolean)),
  )

  const { data: providerProfiles } =
    providerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", providerIds)
      : { data: [] }

  const providerMap = new Map(
    providerProfiles?.map((profile) => [profile.id, profile]) ?? [],
  )

  const now = new Date()
  const upcoming = appointments?.filter((apt) => new Date(apt.scheduled_at) >= now) ?? []
  const past = appointments?.filter((apt) => new Date(apt.scheduled_at) < now) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Appointments</p>
          <h1 className="text-3xl font-semibold text-foreground">Your bookings</h1>
        </div>
        <Link href="/patient/appointments/book">
          <Badge className="cursor-pointer">Book Appointment</Badge>
        </Link>
      </div>

      <section className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
            ) : (
              upcoming.map((appointment) => {
                const provider = providerMap.get(appointment.provider_id ?? "")
                const date = new Date(appointment.scheduled_at)
                return (
                  <div key={appointment.id} className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {provider?.full_name ?? "Provider"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          }).format(date)}
                        </p>
                      </div>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {appointment.type}
                      </p>
                      {appointment.type === "video" && appointment.status === "confirmed" && (
                        <Link href={`/patient/appointments/${appointment.id}/call`}>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Join Call</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {past.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past appointments.</p>
            ) : (
              past.map((appointment) => {
                const provider = providerMap.get(appointment.provider_id ?? "")
                const date = new Date(appointment.scheduled_at)
                return (
                  <div key={appointment.id} className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {provider?.full_name ?? "Provider"}
                        </p>
                        <p className="text-sm text-muted-foreground">{date.toLocaleString()}</p>
                      </div>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {appointment.type}
                    </p>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
