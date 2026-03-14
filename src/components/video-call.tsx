"use client"

type Props = {
  appointmentId: string
}

export default function VideoCall({ appointmentId }: Props) {
  return (
    <iframe
      src={`https://meet.jit.si/healthcare-${appointmentId}`}
      allow="camera; microphone; display-capture; fullscreen"
      className="w-full h-full rounded-lg border"
    />
  )
}
