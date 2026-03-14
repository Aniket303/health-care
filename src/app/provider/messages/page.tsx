import Link from "next/link"
import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function ProviderMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/provider/messages")

  const { data: profile } = await supabase
    .from("profiles").select("id, full_name").eq("id", user.id).maybeSingle()
  if (!profile) redirect("/auth/setup-profile")

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false)

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, content, is_read, created_at")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  type MessageRow = NonNullable<typeof messages>[0]

  const conversationMap = new Map<string, MessageRow>()
  messages?.forEach((m) => {
    const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
    if (!conversationMap.has(otherId)) conversationMap.set(otherId, m)
  })

  const otherIds = Array.from(conversationMap.keys())
  const { data: otherProfiles } = otherIds.length > 0
    ? await supabase.from("profiles").select("id, full_name").in("id", otherIds)
    : { data: [] }
  const profileMap = new Map(otherProfiles?.map((p) => [p.id, p]) ?? [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Inbox</p>
        <h1 className="text-3xl font-semibold text-foreground">Messages</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Conversations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {conversationMap.size === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            Array.from(conversationMap.entries()).map(([otherId, lastMsg]) => {
              const other = profileMap.get(otherId)
              return (
                <Link
                  key={otherId}
                  href={`/provider/messages/${otherId}`}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0 hover:opacity-75"
                >
                  <div>
                    <p className="font-medium">{other?.full_name ?? "Patient"}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {lastMsg.content.slice(0, 60)}{lastMsg.content.length > 60 ? "…" : ""}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(lastMsg.created_at).toLocaleDateString()}
                  </p>
                </Link>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
