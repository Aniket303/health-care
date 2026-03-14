import Link from "next/link"
import { redirect } from "next/navigation"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function ProviderHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/provider")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/auth/setup-profile")
  }

  const today = new Date()
  const dayStart = new Date(today)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(today)
  dayEnd.setHours(23, 59, 59, 999)

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at, patient_id, status")
    .eq("provider_id", profile.id)
    .gte("scheduled_at", dayStart.toISOString())
    .lte("scheduled_at", dayEnd.toISOString())
    .order("scheduled_at", { ascending: true })

  const patientIds = Array.from(
    new Set(appointments?.map((appointment) => appointment.patient_id).filter(Boolean)),
  )

  const { data: patientProfiles } =
    patientIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", patientIds)
      : { data: [] }

  const patientMap = new Map(
    patientProfiles?.map((patient) => [patient.id, patient]) ?? [],
  )

  const { data: clinicalNotes } = await supabase
    .from("clinical_notes")
    .select("id, created_at, patient_id")
    .eq("provider_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(3)

  const notePatientIds = Array.from(
    new Set(clinicalNotes?.map((note) => note.patient_id).filter(Boolean)),
  )

  const { data: notePatients } =
    notePatientIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", notePatientIds)
      : { data: [] }

  const notePatientMap = new Map(
    notePatients?.map((patient) => [patient.id, patient]) ?? [],
  )

  const patientCount = patientIds.length

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Today</p>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{profile.full_name}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
              Manage your appointments, patient records, and clinical notes in one place.
            </p>
          </div>
          <Link href="/provider/schedule">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Full Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Today&apos;s Appointments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{appointments?.length ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Patients</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{patientCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Clinical Notes</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{clinicalNotes?.length ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Messages</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Cards */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Today's Appointments Card */}
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Today&apos;s Appointments</CardTitle>
                <p className="text-emerald-100 text-base mt-1 opacity-90">Your scheduled patient visits</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment, index) => {
                  const patient = patientMap.get(appointment.patient_id)
                  const date = new Date(appointment.scheduled_at)
                  return (
                    <div key={appointment.id} className={`p-4 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-800 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 ${index === 0 ? 'ring-2 ring-emerald-500/20' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                            <AvatarImage src={patient?.avatar_url ?? ""} alt={patient?.full_name ?? "Patient"} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold">{(patient?.full_name ?? "P")[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{patient?.full_name ?? "Patient"}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {new Intl.DateTimeFormat("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                              }).format(date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'} 
                                 className={`px-3 py-1 text-xs font-medium ${appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}`}>
                            {appointment.status}
                          </Badge>
                          {index === 0 && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Next</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No appointments today</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                  You don&apos;t have any appointments scheduled for today. Check your schedule to add availability.
                </p>
                <Link href="/provider/schedule">
                  <Button variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/20">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Manage Schedule
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages & Notes Card */}
        <div className="space-y-8">
          {/* Messages Card */}
          <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-700 text-white p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Messages</CardTitle>
                  <p className="text-orange-100 text-base mt-1 opacity-90">Patient communications</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">No new messages</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Stay connected with your patients through secure messaging.
                </p>
                <Button variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/20">
                  View All Messages
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notes Card */}
          <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-700 text-white p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Recent Notes</CardTitle>
                  <p className="text-purple-100 text-base mt-1 opacity-90">Latest clinical documentation</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {clinicalNotes && clinicalNotes.length > 0 ? (
                <div className="space-y-4">
                  {clinicalNotes.map((note) => {
                    const patient = notePatientMap.get(note.patient_id)
                    return (
                      <div key={note.id} className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-purple-950/20 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{patient?.full_name ?? "Patient"}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(note.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              })}
                            </p>
                          </div>
                          <Link href={`/provider/notes/${note.id}`}>
                            <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/20">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">No recent notes</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Start documenting patient visits and treatments.
                  </p>
                  <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/20">
                    Create First Note
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
