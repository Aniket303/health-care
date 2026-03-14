import Link from "next/link"
import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import AddSlotForm from "./slot-form"
import SlotList from "./slot-list"

export default async function ProviderSchedulePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/provider/schedule")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/auth/setup-profile")
  }

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("id, date, start_time, end_time, is_booked")
    .eq("provider_id", profile.id)
    .order("date", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Schedule</p>
          <h1 className="text-3xl font-semibold text-foreground">Availability</h1>
        </div>
        <Link href="/provider">
          <Button variant="ghost">Back to dashboard</Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add slot</CardTitle>
          </CardHeader>
          <CardContent>
            <AddSlotForm providerId={profile.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current slots</CardTitle>
          </CardHeader>
          <CardContent>
            <SlotList slots={slots ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
