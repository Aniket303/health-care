import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function ProviderAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?next=/provider/analytics")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) redirect("/auth/setup-profile")

  // Fetch all appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, status, type, patient_id, scheduled_at")
    .eq("provider_id", profile.id)

  // Fetch clinical notes count
  const { count: notesCount } = await supabase
    .from("clinical_notes")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", profile.id)

  // Fetch messages sent count
  const { count: messagesSentCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", profile.id)

  // Fetch messages received count
  const { count: messagesReceivedCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", profile.id)

  // Derive stats
  const appts = appointments ?? []
  const totalAppointments = appts.length

  // Group by status
  const statusGroups: Record<string, number> = {
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  }
  appts.forEach((a) => {
    if (a.status in statusGroups) statusGroups[a.status]++
  })

  // Group by type
  const typeGroups: Record<string, number> = {
    video: 0,
    in_person: 0,
    phone: 0,
  }
  appts.forEach((a) => {
    if (a.type && a.type in typeGroups) typeGroups[a.type]++
  })

  // Unique patients
  const uniquePatients = new Set(appts.map((a) => a.patient_id)).size

  // 30-day comparison
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const currentPeriod = appts.filter((a) => {
    const d = new Date(a.scheduled_at)
    return d >= thirtyDaysAgo && d <= now
  }).length

  const prevPeriod = appts.filter((a) => {
    const d = new Date(a.scheduled_at)
    return d >= sixtyDaysAgo && d < thirtyDaysAgo
  }).length

  const delta = currentPeriod - prevPeriod

  const totalMessages = (messagesSentCount ?? 0) + (messagesReceivedCount ?? 0)

  const maxTypeCount = Math.max(...Object.values(typeGroups), 1)

  const statusLabels: Record<string, string> = {
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  }

  const typeLabels: Record<string, string> = {
    video: "Video",
    in_person: "In Person",
    phone: "Phone",
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Overview</p>
        <h1 className="text-3xl font-semibold text-foreground">Analytics</h1>
      </div>

      {/* Row 1: Stat grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Appointments</p>
            <p className="text-3xl font-bold mt-1">{totalAppointments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unique Patients</p>
            <p className="text-3xl font-bold mt-1">{uniquePatients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Notes Written</p>
            <p className="text-3xl font-bold mt-1">{notesCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Messages</p>
            <p className="text-3xl font-bold mt-1">{totalMessages}</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(statusGroups).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm font-medium">{statusLabels[status]}</span>
              <span className="text-sm font-bold">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Row 3: Appointment type bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(typeGroups).map(([type, count]) => {
            const pct = Math.round((count / maxTypeCount) * 100)
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{typeLabels[type]}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Row 4: 30-day comparison */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-muted-foreground">Current 30 days</p>
              <p className="text-3xl font-bold mt-1">{currentPeriod}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Previous 30 days</p>
              <p className="text-3xl font-bold mt-1">{prevPeriod}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delta</p>
              <Badge
                className={`mt-1 text-base px-3 py-1 ${
                  delta >= 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
                variant="secondary"
              >
                {delta >= 0 ? "+" : ""}{delta}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
