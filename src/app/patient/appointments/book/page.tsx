import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function BookProvidersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">Sign in to browse providers.</p>
        </CardContent>
      </Card>
    )
  }

  const { data: providers } = await supabase
    .from("providers")
    .select("id, specialty, bio, years_of_experience")
    .order("specialty", { ascending: true })

  const providerIds = providers?.map((p) => p.id) ?? []

  const { data: profiles } =
    providerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", providerIds)
      : { data: [] }

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])

  // Fetch available slot counts per provider
  const today = new Date().toISOString().slice(0, 10)
  const { data: slotCounts } =
    providerIds.length > 0
      ? await supabase
          .from("availability_slots")
          .select("provider_id")
          .in("provider_id", providerIds)
          .gte("date", today)
          .eq("is_booked", false)
      : { data: [] }

  const slotCountMap = new Map<string, number>()
  slotCounts?.forEach((s) => {
    slotCountMap.set(s.provider_id, (slotCountMap.get(s.provider_id) ?? 0) + 1)
  })

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Book Appointment</p>
        <h1 className="text-3xl font-semibold text-foreground">Choose a Provider</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a provider below to view their available time slots and book an appointment.
        </p>
      </div>

      {(providers?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-muted-foreground">No providers are available right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers?.map((provider) => {
            const profile = profileMap.get(provider.id)
            const openSlots = slotCountMap.get(provider.id) ?? 0
            const hasSlots = openSlots > 0

            return (
              <Card
                key={provider.id}
                className={`flex flex-col transition-shadow hover:shadow-md ${!hasSlots ? "opacity-60" : ""}`}
              >
                <CardContent className="pt-6 flex flex-col gap-4 flex-1">
                  {/* Provider info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border border-border bg-muted">
                      <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.full_name ?? "Provider"} />
                      <AvatarFallback className="text-base font-semibold">
                        {(profile?.full_name ?? "P")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-foreground truncate">
                        {profile?.full_name ?? "Provider"}
                      </p>
                      <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                      {provider.years_of_experience > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {provider.years_of_experience} yr{provider.years_of_experience !== 1 ? "s" : ""} experience
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {provider.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{provider.bio}</p>
                  )}

                  {/* Slot availability */}
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${hasSlots ? "bg-green-500" : "bg-muted-foreground"}`}
                    />
                    <span className={hasSlots ? "text-green-700 dark:text-green-400 font-medium" : "text-muted-foreground"}>
                      {hasSlots ? `${openSlots} slot${openSlots !== 1 ? "s" : ""} available` : "No availability"}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-2">
                    {hasSlots ? (
                      <Link href={`/patient/appointments/book/${provider.id}`}>
                        <Button className="w-full">
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          View & Book
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full" disabled>
                        No Availability
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
