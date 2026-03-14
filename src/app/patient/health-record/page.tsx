import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import HealthRecordForm from "@/components/health-record-form"

export default async function PatientHealthRecordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/patient/health-record")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/auth/setup-profile")
  }

  const { data: record } = await supabase
    .from("patients")
    .select("allergies, current_medications, medical_history, dob, gender")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">My Profile</p>
        <h1 className="text-3xl font-semibold text-foreground">Health Record</h1>
      </div>

      {record?.dob || record?.gender ? (
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {record.dob && (
              <p><span className="font-medium">Date of birth:</span> {record.dob}</p>
            )}
            {record.gender && (
              <p><span className="font-medium">Gender:</span> {record.gender.replace(/_/g, " ")}</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthRecordForm
            patientId={user.id}
            record={{
              allergies: record?.allergies ?? null,
              current_medications: record?.current_medications ?? null,
              medical_history: record?.medical_history ?? null,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}