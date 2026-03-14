"use client"

import * as React from "react"

const statusStyles: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-700",
}

export function AppointmentStatusBadge({
  status,
}: {
  status: string
}) {
  const style = statusStyles[status] ?? "bg-muted text-foreground"
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  )
}
