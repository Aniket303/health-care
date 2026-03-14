import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import MessageForm from "@/components/message-form"

export default async function PatientConversationPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/patient/messages")

  const { data: profile } = await supabase
    .from("profiles").select("id").eq("id", user.id).maybeSingle()
  if (!profile) redirect("/auth/setup-profile")

  const { data: other } = await supabase
    .from("profiles").select("id, full_name").eq("id", userId).maybeSingle()
  if (!other) redirect("/patient/messages")

  // Mark received messages as read
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", userId)
    .eq("receiver_id", user.id)
    .eq("is_read", false)

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Messages</p>
        <h1 className="text-3xl font-semibold text-foreground">{other.full_name}</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(messages?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
            ) : (
              messages?.map((m) => {
                const isMe = m.sender_id === user.id
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs rounded-lg px-3 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <MessageForm senderId={user.id} receiverId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}
