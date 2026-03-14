import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import VideoCall from "@/components/video-call"

export default async function PatientCallPage({
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
    redirect("/auth/login?next=/patient/appointments")
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id")
    .eq("id", appointmentId)
    .eq("patient_id", user.id)
    .maybeSingle()

  if (!appointment) {
    redirect("/patient/appointments")
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Video</p>
        <h1 className="text-3xl font-semibold text-foreground">Consultation</h1>
      </div>

      <div className="h-[80vh]">
        <VideoCall appointmentId={appointmentId} />
      </div>
    </div>
  )
}
