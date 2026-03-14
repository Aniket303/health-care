import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function ProviderPatientRecordPage({
  params,
}: {
  params: Promise<{ patientId: string }>
}) {
  const { patientId } = await params
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

  const { data: patientProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", patientId)
    .maybeSingle()

  const { data: record } = await supabase
    .from("patients")
    .select("allergies, current_medications, medical_history, dob, gender")
    .eq("id", patientId)
    .maybeSingle()

  const { data: notes } = await supabase
    .from("clinical_notes")
    .select("id, subjective, created_at, appointment_id")
    .eq("patient_id", patientId)
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  if (!patientProfile) {
    redirect("/provider/appointments")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Patient</p>
          <h1 className="text-3xl font-semibold text-foreground">{patientProfile.full_name}</h1>
          {patientProfile.email && (
            <p className="text-sm text-muted-foreground">{patientProfile.email}</p>
          )}
        </div>
        <Link href="/provider/appointments">
          <Button variant="ghost">Back to appointments</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {record?.dob ? (
              <p><span className="font-medium">DOB:</span> {record.dob}</p>
            ) : (
              <p className="text-muted-foreground">No demographics on file.</p>
            )}
            {record?.gender && (
              <p><span className="font-medium">Gender:</span> {record.gender.replace(/_/g, " ")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
          </CardHeader>
          <CardContent>
            {record?.allergies && record.allergies.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {record.allergies.map((a: string) => (
                  <li key={a} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive inline-block" />
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No known allergies.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Medications</CardTitle>
          </CardHeader>
          <CardContent>
            {record?.current_medications && record.current_medications.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {record.current_medications.map((m: string) => (
                  <li key={m} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                    {m}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No medications on file.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            {record?.medical_history ? (
              <p className="text-sm whitespace-pre-wrap">{record.medical_history}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No history on file.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent SOAP Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(notes?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No notes for this patient yet.</p>
          ) : (
            notes?.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {new Date(note.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {note.subjective && (
                    <p className="text-xs text-muted-foreground">
                      {note.subjective.slice(0, 80)}{note.subjective.length > 80 ? "…" : ""}
                    </p>
                  )}
                </div>
                <Link href={`/provider/notes/${note.id}`}>
                  <Button variant="outline" size="sm">View / Edit</Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}