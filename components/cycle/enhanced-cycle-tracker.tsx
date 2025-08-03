// components/cycle/enhanced-cycle-tracker.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Droplet, Leaf, Sun, Moon, Lock, Users, Lightbulb } from 'lucide-react'

interface CycleData {
  id: string
  cycle_start_date: string
  period_length: number
  cycle_length: number
  symptoms: string[]
  notes: string
  is_active: boolean
}

const phaseColors = {
  menstrual: 'bg-red-100 text-red-700 border-red-200',
  follicular: 'bg-green-100 text-green-700 border-green-200',
  ovulation: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  luteal: 'bg-purple-100 text-purple-700 border-purple-200'
}

const phaseIcons = {
  menstrual: <Droplet className="h-5 w-5" />,
  follicular: <Leaf className="h-5 w-5" />,
  ovulation: <Sun className="h-5 w-5" />,
  luteal: <Moon className="h-5 w-5" />
}

const phaseDescriptions = {
  menstrual: {
    title: 'Menstrual Phase',
    description: 'Time for rest, self-care, and gentle support',
    emotions: ['introspective', 'sensitive', 'reflective'],
    partnerTips: [
      'Offer extra emotional support and validation',
      'Help with daily tasks without being asked',
      'Provide comfort items and gentle affection',
      'Be patient with mood fluctuations'
    ]
  },
  follicular: {
    title: 'Follicular Phase', 
    description: 'Energy building, great time for new projects and planning',
    emotions: ['optimistic', 'creative', 'motivated'],
    partnerTips: [
      'Support new ideas and creative projects',
      'Plan exciting activities for the future',
      'Engage in meaningful conversations',
      'Match increasing energy levels'
    ]
  },
  ovulation: {
    title: 'Ovulation Phase',
    description: 'Peak energy, confidence, and communication',
    emotions: ['confident', 'outgoing', 'energetic'],
    partnerTips: [
      'Express attraction and desire openly',
      'Plan romantic and exciting activities', 
      'Engage in deep meaningful conversations',
      'Take advantage of openness to intimacy'
    ]
  },
  luteal: {
    title: 'Luteal Phase',
    description: 'Focus on completion, may need extra patience and support',
    emotions: ['focused', 'detail-oriented', 'potentially moody'],
    partnerTips: [
      'Provide extra emotional reassurance',
      'Help complete tasks and reduce stress',
      'Be patient with mood fluctuations',
      'Offer comfort and stability'
    ]
  }
}

// Simple phase calculation
function calculatePhase(startDate: string, dayInCycle: number): 'menstrual' | 'follicular' | 'ovulation' | 'luteal' {
  if (dayInCycle <= 5) return 'menstrual'
  if (dayInCycle <= 12) return 'follicular'  
  if (dayInCycle <= 16) return 'ovulation'
  return 'luteal'
}

function getDayInCycle(startDate: string): number {
  const start = new Date(startDate)
  const today = new Date()
  return Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1
}

export function EnhancedCycleTracker({ userId, supabase }: { userId: string, supabase: any }) {
  const [currentCycle, setCurrentCycle] = useState<CycleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStartForm, setShowStartForm] = useState(false)
  const [showEndForm, setShowEndForm] = useState(false)
  const [periodStartDate, setPeriodStartDate] = useState('')
  const [periodEndDate, setPeriodEndDate] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  // Current phase calculation
  const currentPhase = currentCycle ? calculatePhase(currentCycle.cycle_start_date, getDayInCycle(currentCycle.cycle_start_date)) : null
  const dayInCycle = currentCycle ? getDayInCycle(currentCycle.cycle_start_date) : 0
  const phaseInfo = currentPhase ? phaseDescriptions[currentPhase] : null

  useEffect(() => {
    loadCycleData()
  }, [userId])

const loadCycleData = async () => {
  try {
    setLoading(true)

    // Load current active cycle - DON'T use .single() since user might not have data
    const { data: cycleData, error } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      // Remove .single() - this was causing the 406 error!

    if (error) {
      console.error('Supabase error:', error)
      setMessage(`Database error: ${error.message}`)
      setCurrentCycle(null)
    } else {
      // Handle the case where data is an array
      if (cycleData && cycleData.length > 0) {
        setCurrentCycle(cycleData[0]) // Take the first active cycle
        setMessage('')
      } else {
        setCurrentCycle(null) // No active cycles found - this is normal!
        setMessage('')
      }
    }

  } catch (error: any) {
    console.error('Error loading cycle data:', error)
    setMessage(`Error: ${error.message}`)
  } finally {
    setLoading(false)
  }
}

  const startNewCycle = async () => {
    if (!periodStartDate) return

    try {
      // End any existing active cycle
      if (currentCycle) {
        const cycleLength = Math.ceil(
          (new Date(periodStartDate).getTime() - new Date(currentCycle.cycle_start_date).getTime()) / 
          (24 * 60 * 60 * 1000)
        )

        await supabase
          .from('menstrual_cycles')
          .update({ 
            is_active: false,
            cycle_length: Math.max(cycleLength, 21)
          })
          .eq('id', currentCycle.id)
      }

      // Create new cycle
      const { data, error } = await supabase
        .from('menstrual_cycles')
        .insert([{
          user_id: userId,
          cycle_start_date: periodStartDate,
          cycle_length: 28,
          period_length: 5,
          symptoms: symptoms.length > 0 ? symptoms : null,
          notes: notes.trim() || null,
          is_active: true
        }])
        .select()
        .single()

      if (error) throw error

      setMessage('Period started! Cycle tracking began. 🌸')
      setShowStartForm(false)
      setPeriodStartDate('')
      setSymptoms([])
      setNotes('')
      
      await loadCycleData()

    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    }
  }

  const endCurrentPeriod = async () => {
    if (!currentCycle || !periodEndDate) return

    try {
      const periodLength = Math.ceil(
        (new Date(periodEndDate).getTime() - new Date(currentCycle.cycle_start_date).getTime()) / 
        (24 * 60 * 60 * 1000)
      ) + 1

      const { error } = await supabase
        .from('menstrual_cycles')
        .update({ 
          period_length: Math.max(Math.min(periodLength, 10), 1),
          symptoms: symptoms.length > 0 ? [...(currentCycle.symptoms || []), ...symptoms] : currentCycle.symptoms,
          notes: notes.trim() ? `${currentCycle.notes || ''}\n${notes}`.trim() : currentCycle.notes
        })
        .eq('id', currentCycle.id)

      if (error) throw error

      setMessage('Period ended! Data updated. ✨')
      setShowEndForm(false)
      setPeriodEndDate('')
      setSymptoms([])
      setNotes('')
      
      await loadCycleData()

    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    }
  }

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  const availableSymptoms = [
    'Cramps', 'Bloating', 'Mood swings', 'Fatigue', 'Headache',
    'Breast tenderness', 'Acne', 'Food cravings', 'Back pain', 'Nausea',
    'Irritability', 'Lower back pain', 'Anxiety', 'Increased appetite'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Enhanced Cycle Tracker</h2>
          <p className="text-gray-600 mt-2">
            Track your cycle and get relationship-focused insights
          </p>
        </div>
        <div className="flex space-x-3">
          {!currentCycle ? (
            <Button 
              onClick={() => setShowStartForm(true)}
              className="bg-mint-600 hover:bg-mint-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowEndForm(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                End Period
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Current Cycle & Insights */}
      {currentCycle && currentPhase && phaseInfo && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Phase Card */}
          <Card className={`border-2 ${phaseColors[currentPhase]}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {phaseIcons[currentPhase]}
                  {phaseInfo.title}
                </CardTitle>
                <CardDescription>
                  Day {dayInCycle} of your cycle
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Day {dayInCycle}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Phase Overview</h4>
                <p className="text-sm text-gray-600">
                  {phaseInfo.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Common Emotions</h4>
                <div className="flex flex-wrap gap-1">
                  {phaseInfo.emotions.map((emotion: string) => (
                    <Badge key={emotion} variant="outline" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-calm-500" />
                Your Personal Insights
                <Badge variant="secondary" className="text-xs">Private</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">What to Expect</h4>
                <p className="text-sm text-gray-600">
                  During the {currentPhase} phase, you might feel {phaseInfo.emotions.join(', ')}. 
                  This is a natural part of your cycle.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Self-Care Tips</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Focus on {currentPhase === 'menstrual' ? 'rest and comfort' : currentPhase === 'follicular' ? 'new projects and planning' : currentPhase === 'ovulation' ? 'connection and communication' : 'completing tasks and self-care'}</li>
                  <li>• Listen to your body's needs</li>
                  <li>• Be patient with yourself</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Partner Guidance */}
      {currentCycle && currentPhase && phaseInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-mint-500" />
              Partner Guidance
              <Badge variant="secondary" className="text-xs">Shared Discretely</Badge>
            </CardTitle>
            <CardDescription>
              Insights shared with your partners to help them support you better
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">How Your Partner Can Help</h4>
              <div className="space-y-2">
                {phaseInfo.partnerTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Period Form */}
      {showStartForm && (
        <Card>
          <CardHeader>
            <CardTitle>Start New Cycle</CardTitle>
            <CardDescription>Record when your period started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Period Start Date</label>
              <Input
                type="date"
                value={periodStartDate}
                onChange={(e) => setPeriodStartDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Symptoms (optional)</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {availableSymptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`text-xs px-2 py-1 rounded border ${
                      symptoms.includes(symptom)
                        ? 'bg-mint-100 border-mint-300 text-mint-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about how you're feeling..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={startNewCycle} className="bg-mint-600 hover:bg-mint-700">
                Start Tracking
              </Button>
              <Button variant="outline" onClick={() => setShowStartForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* End Period Form */}
      {showEndForm && currentCycle && (
        <Card>
          <CardHeader>
            <CardTitle>End Current Period</CardTitle>
            <CardDescription>Record when your period ended</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Period End Date</label>
              <Input
                type="date"
                value={periodEndDate}
                onChange={(e) => setPeriodEndDate(e.target.value)}
                min={currentCycle.cycle_start_date}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Additional Symptoms (optional)</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {availableSymptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`text-xs px-2 py-1 rounded border ${
                      symptoms.includes(symptom)
                        ? 'bg-mint-100 border-mint-300 text-mint-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this cycle..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={endCurrentPeriod} className="bg-red-600 hover:bg-red-700">
                End Period
              </Button>
              <Button variant="outline" onClick={() => setShowEndForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Active Cycle Message */}
      {!currentCycle && !showStartForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Cycle</h3>
            <p className="text-gray-600 mb-4">Start tracking your cycle to get personalized relationship insights</p>
            <Button 
              onClick={() => setShowStartForm(true)}
              className="bg-mint-600 hover:bg-mint-700"
            >
              Begin Cycle Tracking
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}