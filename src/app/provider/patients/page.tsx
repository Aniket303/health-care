import Link from "next/link"
import { redirect } from "next/navigation"
import { User, Calendar, FileText, Mail } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function ProviderPatientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/provider/patients")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/auth/setup-profile")
  }

  // Get all unique patients that have appointments with this provider
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      patient_id,
      status,
      appointment_date,
      patient:profiles!appointments_patient_id_fkey(
        id,
        full_name,
        email
      )
    `)
    .eq("provider_id", user.id)
    .order("appointment_date", { ascending: false })

  // Get patient health records for additional info
  const patientIds = [...new Set(appointments?.map(apt => apt.patient_id) || [])]
  
  const { data: patientRecords } = await supabase
    .from("patients")
    .select("id, dob, gender, created_at")
    .in("id", patientIds)

  // Get recent clinical notes count for each patient
  const { data: notesCount } = await supabase
    .from("clinical_notes")
    .select("patient_id, id")
    .eq("provider_id", user.id)
    .in("patient_id", patientIds)

  // Create a map of patient records and notes count
  const patientRecordsMap = new Map(patientRecords?.map(record => [record.id, record]) || [])
  const notesCountMap = new Map()
  notesCount?.forEach(note => {
    notesCountMap.set(note.patient_id, (notesCountMap.get(note.patient_id) || 0) + 1)
  })

  // Group appointments by patient and get the most recent appointment for each
  const patientsMap = new Map()
  appointments?.forEach(appointment => {
    if (appointment.patient) {
      const existingPatient = patientsMap.get(appointment.patient_id)
      if (!existingPatient || new Date(appointment.appointment_date) > new Date(existingPatient.lastAppointment)) {
        patientsMap.set(appointment.patient_id, {
          ...appointment.patient,
          patientId: appointment.patient_id,
          lastAppointment: appointment.appointment_date,
          lastStatus: appointment.status,
          record: patientRecordsMap.get(appointment.patient_id),
          notesCount: notesCountMap.get(appointment.patient_id) || 0
        })
      }
    }
  })

  const patients = Array.from(patientsMap.values()).sort((a, b) => 
    new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime()
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'confirmed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'no_show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
          <p className="text-muted-foreground">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} in your care
          </p>
        </div>
      </div>

      {patients.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients yet</h3>
            <p className="text-muted-foreground mb-6">
              Patients will appear here once you have appointments scheduled with them.
            </p>
            <Link href="/provider/schedule">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Calendar className="mr-2 h-4 w-4" />
                Set Up Your Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {patients.map((patient) => {
            const patientRecord = patient.record
            const age = patientRecord?.dob 
              ? Math.floor((new Date().getTime() - new Date(patientRecord.dob).getTime()) / (1000 * 3600 * 24 * 365))
              : null

            return (
              <Card key={patient.patientId} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-emerald-100 dark:border-emerald-900">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                          {patient.full_name ? patient.full_name.split(' ').map((n: string) => n[0]).join('') : 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{patient.full_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                        {age && patientRecord?.gender && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {age} years old • {patientRecord.gender.replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(patient.lastStatus)}>
                      {patient.lastStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Last Visit
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(patient.lastAppointment).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Clinical Notes
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {patient.notesCount} note{patient.notesCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Patient Since
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {patientRecord?.created_at 
                            ? new Date(patientRecord.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-6">
                      <Link href={`/provider/appointments?patient=${patient.patientId}`}>
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Appointments
                        </Button>
                      </Link>
                      <Link href={`/provider/patients/${patient.patientId}`}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          <FileText className="mr-2 h-4 w-4" />
                          View Record
                        </Button>
                      </Link>
                    </div>
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