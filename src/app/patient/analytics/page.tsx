import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function PatientAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?next=/patient/analytics")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) redirect("/auth/setup-profile")

  // Fetch appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, status, scheduled_at")
    .eq("patient_id", profile.id)

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

  // Fetch patient health record
  const { data: patientRecord } = await supabase
    .from("patients")
    .select("allergies, current_medications, medical_history")
    .eq("id", user.id)
    .maybeSingle()

  // Derive stats
  const appts = appointments ?? []
  const totalAppointments = appts.length
  const completedAppointments = appts.filter((a) => a.status === "completed").length
  const cancelledAppointments = appts.filter((a) => a.status === "cancelled").length
  const now = new Date()
  const upcomingAppointments = appts.filter(
    (a) => new Date(a.scheduled_at) > now && a.status !== "cancelled",
  ).length

  // Health record completeness
  const fields = [
    patientRecord?.allergies,
    patientRecord?.current_medications,
    patientRecord?.medical_history,
  ]
  const filledFields = fields.filter((f) => f && String(f).trim().length > 0).length
  const completenessPct = Math.round((filledFields / 3) * 100)

  const sent = messagesSentCount ?? 0
  const received = messagesReceivedCount ?? 0

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Overview</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
      </div>

      {/* Row 1: 4-col stat grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-green-100 dark:border-green-900/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-red-100 dark:border-red-900/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cancelledAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{upcomingAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Messages + Health Record Completeness */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{sent}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Received</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{received}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Health Record Completeness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{filledFields} of 3 fields filled</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{completenessPct}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all"
                  style={{ width: `${completenessPct}%` }}
                />
              </div>
            </div>
            <Link href="/patient/health-record">
              <Button variant="outline" className="w-full mt-2">
                Update Health Record
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
