import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import NoteForm from "@/components/note-form"
import VideoCall from "@/components/video-call"

export default async function ProviderCallPage({
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
    .select("id, patient_id, provider_id")
    .eq("id", appointmentId)
    .eq("provider_id", user.id)
    .maybeSingle()

  if (!appointment) {
    redirect("/provider/appointments")
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Video</p>
        <h1 className="text-3xl font-semibold text-foreground">Consultation</h1>
      </div>

      <div className="flex gap-6">
        <div className="w-3/5 h-[600px]">
          <VideoCall appointmentId={appointmentId} />
        </div>

        <div className="flex-1">
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
      </div>
    </div>
  )
}
