"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

type Slot = {
  id: string
  date: string        // "YYYY-MM-DD"
  start_time: string  // "HH:MM:SS"
  end_time: string
  provider_id: string
}

type AppointmentType = "video" | "phone" | "in_person"

const TYPE_META: Record<AppointmentType, { label: string; icon: string; desc: string }> = {
  video: {
    label: "Video",
    icon: "M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    desc: "Video call with provider",
  },
  phone: {
    label: "Phone",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    desc: "Audio call with provider",
  },
  in_person: {
    label: "In Person",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    desc: "Visit clinic in person",
  },
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}

export default function PatientBookingForm({
  provider,
  slots,
  patientId,
}: {
  provider: { id: string; specialty: string }
  slots: Slot[]
  patientId: string
}) {
  const router = useRouter()
  const today = new Date()

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("video")
  const [submitting, setSubmitting] = useState(false)

  // Build a set of dates that have available slots
  const availableDates = new Set(slots.map((s) => s.date))

  // Slots for the selected date
  const slotsForDate = selectedDate
    ? slots.filter((s) => s.date === selectedDate).sort((a, b) => a.start_time.localeCompare(b.start_time))
    : []

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayStr = today.toISOString().slice(0, 10)

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  function selectDate(dateStr: string) {
    setSelectedDate(dateStr)
    setSelectedSlotId(null)
  }

  async function handleConfirm() {
    if (!selectedSlotId) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const slot = slots.find((s) => s.id === selectedSlotId)
      if (!slot) throw new Error("Select a valid slot.")

      const scheduledAt = new Date(`${slot.date}T${slot.start_time}`).toISOString()

      const { error } = await supabase.from("appointments").insert({
        patient_id: patientId,
        provider_id: provider.id,
        slot_id: slot.id,
        scheduled_at: scheduledAt,
        duration_minutes: 30,
        status: "scheduled",
        type: appointmentType,
      })
      if (error) throw error

      await supabase
        .from("availability_slots")
        .update({ is_booked: true })
        .eq("id", slot.id)

      toast.success("Appointment confirmed!")
      router.push("/patient/appointments")
    } catch (err) {
      if (err instanceof Error) toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedSlot = slots.find((s) => s.id === selectedSlotId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Book Appointment</p>
        <h1 className="text-3xl font-semibold text-foreground">{provider.specialty}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {slots.length === 0
            ? "No availability at this time."
            : `${slots.length} slot${slots.length !== 1 ? "s" : ""} available`}
        </p>
      </div>

      {slots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground">This provider has no open slots right now.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Go back
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left: Calendar + Time Slots */}
          <div className="space-y-6">
            {/* Step 1 — Calendar */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Step 1 — Select a date
                </p>

                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Previous month"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-base font-semibold text-foreground">
                    {MONTHS[viewMonth]} {viewYear}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Next month"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Date cells */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    const isPast = dateStr < todayStr
                    const hasSlots = availableDates.has(dateStr)
                    const isSelected = selectedDate === dateStr
                    const isToday = dateStr === todayStr

                    return (
                      <button
                        key={dateStr}
                        disabled={isPast || !hasSlots}
                        onClick={() => selectDate(dateStr)}
                        className={[
                          "relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all",
                          isPast || !hasSlots
                            ? "text-muted-foreground/40 cursor-not-allowed"
                            : "cursor-pointer hover:bg-primary/10",
                          isSelected
                            ? "bg-primary text-primary-foreground hover:bg-primary"
                            : "",
                          isToday && !isSelected
                            ? "ring-2 ring-primary ring-offset-1"
                            : "",
                          hasSlots && !isSelected && !isPast
                            ? "text-foreground font-semibold"
                            : "",
                        ].join(" ")}
                      >
                        {day}
                        {hasSlots && !isPast && !isSelected && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                  Dates with available slots
                </p>
              </CardContent>
            </Card>

            {/* Step 2 — Time Slots */}
            {selectedDate && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Step 2 — Select a time
                  </p>
                  <p className="text-sm text-foreground font-medium mb-4">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>

                  {slotsForDate.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No slots for this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slotsForDate.map((slot) => {
                        const isChosen = selectedSlotId === slot.id
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={[
                              "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                              isChosen
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-input bg-background text-foreground hover:border-primary hover:bg-primary/5",
                            ].join(" ")}
                          >
                            {fmt12(slot.start_time)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3 — Appointment type */}
            {selectedSlotId && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Step 3 — Visit type
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(TYPE_META) as AppointmentType[]).map((type) => {
                      const meta = TYPE_META[type]
                      const isChosen = appointmentType === type
                      return (
                        <button
                          key={type}
                          onClick={() => setAppointmentType(type)}
                          className={[
                            "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                            isChosen
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                          ].join(" ")}
                        >
                          <svg
                            className={`w-6 h-6 ${isChosen ? "text-primary" : "text-muted-foreground"}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={meta.icon} />
                          </svg>
                          <span className="text-sm font-semibold">{meta.label}</span>
                          <span className="text-xs leading-tight">{meta.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Booking summary */}
          <div>
            <Card className="sticky top-6">
              <CardContent className="pt-6 space-y-5">
                <p className="text-base font-semibold text-foreground">Booking Summary</p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-muted-foreground">Specialty</p>
                      <p className="font-medium text-foreground">{provider.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">
                        {selectedDate
                          ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "short", month: "short", day: "numeric", year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium text-foreground">
                        {selectedSlot
                          ? `${fmt12(selectedSlot.start_time)} – ${fmt12(selectedSlot.end_time)}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={TYPE_META[appointmentType].icon} />
                    </svg>
                    <div>
                      <p className="text-muted-foreground">Visit Type</p>
                      <p className="font-medium text-foreground">{TYPE_META[appointmentType].label}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">30 minutes</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  {!selectedDate && (
                    <p className="text-xs text-muted-foreground text-center">
                      Select a date to continue
                    </p>
                  )}
                  {selectedDate && !selectedSlotId && (
                    <p className="text-xs text-muted-foreground text-center">
                      Select a time slot to continue
                    </p>
                  )}
                  <Button
                    className="w-full"
                    disabled={!selectedSlotId || submitting}
                    onClick={handleConfirm}
                  >
                    {submitting ? "Confirming…" : "Confirm Appointment"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    Back to providers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
