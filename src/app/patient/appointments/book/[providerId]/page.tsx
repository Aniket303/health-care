import PatientBookingForm from "@/components/patient-booking-form"
import { createClient as createServerClient } from "@/lib/supabase/server"


export default async function ProviderBookingPage({
  params,
}: {
  params: Promise<{ providerId: string }>
}) {
  const { providerId } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Please sign in to book.</p>
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id, specialty")
    .eq("id", providerId)
    .maybeSingle()

  if (!provider) {
    return <p>Provider not found.</p>
  }

  const today = new Date().toISOString().slice(0, 10)

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("id, date, start_time, end_time, provider_id")
    .eq("provider_id", provider.id)
    .gte("date", today)
    .eq("is_booked", false)
    .order("date", { ascending: true })

  const patient = user.id

  return (
    <PatientBookingForm provider={provider} slots={slots ?? []} patientId={patient} />
  )
}
