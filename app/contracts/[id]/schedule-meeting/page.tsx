"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, Calendar, Clock, Video, Users, Loader2, CalendarPlus } from "lucide-react"
import { contractService } from "@/lib/services"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function ScheduleMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meetingType, setMeetingType] = useState<string>("project_review")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [duration, setDuration] = useState<string>("60")
  const [platform, setPlatform] = useState<string>("zoom")
  const [agenda, setAgenda] = useState<string>("")
  const [participants, setParticipants] = useState<string>("")
  const [contract, setContract] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Generate time slots
  const timeSlots = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  // Load contract data and check access
  useEffect(() => {
    const loadContract = async () => {
      if (!isAuthenticated) {
        router.push("/auth/login")
        return
      }
      
      if (user?.accountType !== "paid") {
        router.push("/upgrade")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const contractData = await contractService.getContractById(id)
        
        if (!contractData) {
          setError("Contract not found or access denied")
          setIsLoading(false)
          return
        }

        setContract(contractData)
        
        // Set default participants
        setParticipants(`${contractData.provider.name}, ${contractData.needer.name}`)
        
        setIsLoading(false)
        
      } catch (error) {
        console.error("Error loading contract:", error)
        setError("Failed to load contract data")
        setIsLoading(false)
      }
    }

    loadContract()
  }, [isAuthenticated, user, id, router])

  // Redirect if not authenticated or not paid
  if (!isAuthenticated || user?.accountType !== "paid") {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load your contract details.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || "Contract not found"}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !selectedDate || !selectedTime || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Check if selected date is in the future
    const meetingDateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':').map(Number)
    meetingDateTime.setHours(hours, minutes, 0, 0)
    
    if (meetingDateTime <= new Date()) {
      toast({
        title: "Invalid date/time",
        description: "Please select a future date and time for the meeting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create meeting invitation message
      const meetingInvitation = `MEETING INVITATION

Title: ${title}
Type: ${meetingType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}

Date & Time: ${format(selectedDate, 'EEEE, MMMM d, yyyy')} at ${selectedTime}
Duration: ${duration} minutes
Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}

Description:
${description}

${agenda ? `Agenda:
${agenda}` : ''}

Participants: ${participants}

Please confirm your availability for this meeting. Meeting details and joining instructions will be shared once confirmed.`

      // Send as contract message
      await contractService.sendContractMessage(id, meetingInvitation)

      // Log as contract activity  
      await contractService.submitModificationRequest(
        id, 
        "meeting_scheduled", 
        `Meeting scheduled: ${title}`, 
        `Meeting scheduled for ${format(selectedDate, 'MMM d, yyyy')} at ${selectedTime}`, 
        "normal"
      )
      
      toast({
        title: "Meeting scheduled",
        description: "Your meeting invitation has been sent to all participants.",
      })
      
      router.push(`/contracts/${id}/messages`)
    } catch (error) {
      console.error("Error scheduling meeting:", error)
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Schedule Meeting</h1>
          <p className="text-muted-foreground">For contract: {contract.title}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Meeting Details
          </CardTitle>
          <CardDescription>
            Schedule a meeting with the other party to discuss project matters, review progress, or resolve issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="meetingType">Meeting Type</Label>
                <RadioGroup
                  id="meetingType"
                  value={meetingType}
                  onValueChange={setMeetingType}
                  className="mt-2 space-y-2"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="project_review" id="project_review" />
                    <Label htmlFor="project_review" className="cursor-pointer">
                      Project Review
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="milestone_discussion" id="milestone_discussion" />
                    <Label htmlFor="milestone_discussion" className="cursor-pointer">
                      Milestone Discussion
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="issue_resolution" id="issue_resolution" />
                    <Label htmlFor="issue_resolution" className="cursor-pointer">
                      Issue Resolution
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="planning" id="planning" />
                    <Label htmlFor="planning" className="cursor-pointer">
                      Planning & Strategy
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="kickoff" id="kickoff" />
                    <Label htmlFor="kickoff" className="cursor-pointer">
                      Project Kickoff
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="platform">Meeting Platform</Label>
                <Select value={platform} onValueChange={setPlatform} disabled={isSubmitting}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Zoom
                      </div>
                    </SelectItem>
                    <SelectItem value="teams">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Microsoft Teams
                      </div>
                    </SelectItem>
                    <SelectItem value="meet">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Google Meet
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Phone Call
                      </div>
                    </SelectItem>
                    <SelectItem value="in_person">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        In Person
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                placeholder="e.g., Weekly Project Review, Milestone 2 Discussion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="description">Meeting Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what will be discussed in this meeting"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 min-h-[80px]"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Meeting Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                      disabled={isSubmitting}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Meeting Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime} disabled={isSubmitting}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={duration} onValueChange={setDuration} disabled={isSubmitting}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="participants">Participants</Label>
              <Input
                id="participants"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="mt-1"
                disabled={isSubmitting}
                placeholder="Names or emails of meeting participants"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Automatically includes both contract parties. Add additional participants if needed.
              </p>
            </div>

            <div>
              <Label htmlFor="agenda">Meeting Agenda (Optional)</Label>
              <Textarea
                id="agenda"
                placeholder="1. Review current progress&#10;2. Discuss upcoming milestones&#10;3. Address any blockers&#10;4. Next steps"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="mt-1 min-h-[120px]"
                disabled={isSubmitting}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
              <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Meeting Invitation</p>
                <p className="text-blue-700 mt-1">
                  This will send a meeting invitation to all participants via the contract messaging system. 
                  Meeting details and joining instructions will be shared once the meeting is confirmed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedDate || !selectedTime}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}