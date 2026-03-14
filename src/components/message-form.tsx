"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type FormValues = { content: string }

type Props = {
  senderId: string
  receiverId: string
}

export default function MessageForm({ senderId, receiverId }: Props) {
  const router = useRouter()
  const { register, handleSubmit, reset } = useForm<FormValues>()

  const onSubmit = async (values: FormValues) => {
    if (!values.content.trim()) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("messages").insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: values.content.trim(),
      })
      if (error) throw error
      reset()
      router.refresh()
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  return (
    <form className="flex gap-2 items-end" onSubmit={handleSubmit(onSubmit)}>
      <textarea
        rows={2}
        className="flex-1 rounded-lg border border-input px-3 py-2 text-sm"
        placeholder="Type a message..."
        {...register("content", { required: true })}
      />
      <Button type="submit">Send</Button>
    </form>
  )
}
