'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function CycleTrackerPage() {
  const [user, setUser] = useState<any>(null)
  const [currentCycle, setCurrentCycle] = useState<any>(null)
  const [cycles, setCycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  // Form state
  const [showStartForm, setShowStartForm] = useState(false)
  const [showEndForm, setShowEndForm] = useState(false)
  const [periodStartDate, setPeriodStartDate] = useState('')
  const [periodEndDate, setPeriodEndDate] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  // Prediction state
  const [predictions, setPredictions] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadCycleData(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadCycleData = async (userId: string) => {
    try {
      // Load all cycles
      const { data: cycleData, error: cycleError } = await supabase
        .from('menstrual_cycles')
        .select('*')
        .eq('user_id', userId)
        .order('cycle_start_date', { ascending: false })

      if (cycleData && !cycleError) {
        setCycles(cycleData)
        
        // Find active cycle
        const activeCycle = cycleData.find(cycle => cycle.is_active)
        setCurrentCycle(activeCycle)
        
        // Generate predictions if we have enough data
        if (cycleData.length >= 2) {
          generatePredictions(cycleData)
        }
      }
    } catch (error) {
      console.error('Error loading cycle data:', error)
    }
  }

  const generatePredictions = (cycleHistory: any[]) => {
    // Calculate average cycle length from last 6 cycles
    const recentCycles = cycleHistory.slice(0, 6)
    const completedCycles = recentCycles.filter(cycle => !cycle.is_active)
    
    if (completedCycles.length >= 2) {
      const avgCycleLength = completedCycles.reduce((sum, cycle) => sum + cycle.cycle_length, 0) / completedCycles.length
      const avgPeriodLength = completedCycles.reduce((sum, cycle) => sum + cycle.period_length, 0) / completedCycles.length
      
      // Predict next period based on current cycle or last completed cycle
      const lastCycle = cycleHistory[0]
      const lastStartDate = new Date(lastCycle.cycle_start_date)
      const predictedNextStart = new Date(lastStartDate.getTime() + (avgCycleLength * 24 * 60 * 60 * 1000))
      const predictedNextEnd = new Date(predictedNextStart.getTime() + (avgPeriodLength * 24 * 60 * 60 * 1000))
      
      // Calculate current cycle day
      const today = new Date()
      const currentCycleDay = Math.floor((today.getTime() - lastStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
      
      // Determine cycle phase
      let phase = 'follicular'
      if (currentCycleDay <= avgPeriodLength) {
        phase = 'menstrual'
      } else if (currentCycleDay >= avgCycleLength / 2 - 2 && currentCycleDay <= avgCycleLength / 2 + 2) {
        phase = 'ovulation'
      } else if (currentCycleDay > avgCycleLength / 2 + 2) {
        phase = 'luteal'
      }
      
      setPredictions({
        avgCycleLength: Math.round(avgCycleLength),
        avgPeriodLength: Math.round(avgPeriodLength),
        nextPeriodStart: predictedNextStart,
        nextPeriodEnd: predictedNextEnd,
        currentCycleDay,
        currentPhase: phase,
        daysUntilNext: Math.max(0, Math.ceil((predictedNextStart.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)))
      })
    }
  }

  const startNewCycle = async () => {
    if (!user || !periodStartDate) return

    try {
      // End any active cycle
      if (currentCycle) {
        const cycleLength = Math.ceil((new Date(periodStartDate).getTime() - new Date(currentCycle.cycle_start_date).getTime()) / (24 * 60 * 60 * 1000))
        
        await supabase
          .from('menstrual_cycles')
          .update({ 
            is_active: false,
            cycle_length: cycleLength
          })
          .eq('id', currentCycle.id)
      }

      // Create new cycle
      const { data, error } = await supabase
        .from('menstrual_cycles')
        .insert([{
          user_id: user.id,
          cycle_start_date: periodStartDate,
          cycle_length: 28, // Default, will be updated when cycle ends
          period_length: 5, // Default, will be updated when period ends
          symptoms: symptoms.length > 0 ? symptoms : null,
          notes: notes.trim() || null,
          is_active: true
        }])
        .select()

      if (error) throw error

      setMessage('Period started! Cycle tracking began. 🌸')
      setShowStartForm(false)
      setPeriodStartDate('')
      setSymptoms([])
      setNotes('')
      
      // Reload data
      await loadCycleData(user.id)

    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    }
  }

  const endCurrentPeriod = async () => {
    if (!user || !currentCycle || !periodEndDate) return

    try {
      const periodLength = Math.ceil((new Date(periodEndDate).getTime() - new Date(currentCycle.cycle_start_date).getTime()) / (24 * 60 * 60 * 1000)) + 1

      const { error } = await supabase
        .from('menstrual_cycles')
        .update({ 
          period_length: periodLength,
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
      
      // Reload data
      await loadCycleData(user.id)

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
    'Breast tenderness', 'Acne', 'Food cravings', 'Back pain', 'Nausea'
  ]

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'text-red-600 bg-red-100'
      case 'follicular': return 'text-green-600 bg-green-100'
      case 'ovulation': return 'text-purple-600 bg-purple-100'
      case 'luteal': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'Menstrual phase - Rest and self-care time'
      case 'follicular': return 'Follicular phase - Energy building, great for new projects'
      case 'ovulation': return 'Ovulation phase - Peak energy and communication'
      case 'luteal': return 'Luteal phase - Focus on completion and reflection'
      default: return 'Tracking your cycle'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-calm-800">Relationship OS</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-700">
                Dashboard
              </Link>
              <Link href="/journal" className="text-gray-600 hover:text-gray-700">
                Journal
              </Link>
              <Link href="/checkin" className="text-gray-600 hover:text-gray-700">
                Check-In
              </Link>
              <Link href="/insights" className="text-gray-600 hover:text-gray-700">
                Insights
              </Link>
              <Link href="/relationships" className="text-gray-600 hover:text-gray-700">
                Relationships
              </Link>
              <Link href="/cycle" className="text-mint-700 hover:text-mint-800 font-medium">
                Cycle Tracker
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-700">
                Settings
              </Link>
              <Button 
                variant="ghost" 
                className="text-gray-600"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Cycle Tracker</h2>
              <p className="text-gray-600 mt-2">
                Track your menstrual cycle and get personalized insights
              </p>
            </div>
            <div className="flex space-x-3">
              {!currentCycle ? (
                <Button 
                  onClick={() => setShowStartForm(true)}
                  className="bg-mint-600 hover:bg-mint-700"
                >
                  Start Period
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowEndForm(true)}
                  variant="outline"
                  className="border-mint-300 text-mint-700"
                >
                  End Period
                </Button>
              )}
            </div>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') || message.includes('error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-mint-50 text-mint-700 border border-mint-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Current Status & Predictions */}
        {predictions && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Current Phase */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Status</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getPhaseColor(predictions.currentPhase)}`}>
                    Day {predictions.currentCycleDay} • {predictions.currentPhase}
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">
                    {getPhaseDescription(predictions.currentPhase)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Cycle Day:</span>
                      <span className="font-medium ml-2">{predictions.currentCycleDay}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phase:</span>
                      <span className="font-medium ml-2 capitalize">{predictions.currentPhase}</span>
                    </div>
                  </div>
                </div>

                {currentCycle && (
                  <div className="text-sm text-gray-600">
                    <p>Current period started: <strong>{formatDate(currentCycle.cycle_start_date)}</strong></p>
                  </div>
                )}
              </div>
            </div>

            {/* Predictions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Predictions</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-mint-600">
                    {predictions.daysUntilNext}
                  </div>
                  <p className="text-gray-600 text-sm">days until next period</p>
                </div>

                <div className="bg-mint-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next period:</span>
                      <span className="font-medium">{formatDate(predictions.nextPeriodStart.toISOString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected end:</span>
                      <span className="font-medium">{formatDate(predictions.nextPeriodEnd.toISOString())}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-gray-900">{predictions.avgCycleLength}</div>
                    <div className="text-gray-600">Avg Cycle</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-gray-900">{predictions.avgPeriodLength}</div>
                    <div className="text-gray-600">Avg Period</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {cycles.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
            <svg className="w-16 h-16 text-mint-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Tracking Your Cycle</h3>
            <p className="text-gray-600 mb-6">
              Begin tracking to get personalized predictions and insights about your menstrual cycle.
            </p>
            <Button 
              onClick={() => setShowStartForm(true)}
              className="bg-mint-600 hover:bg-mint-700"
            >
              Log Your First Period
            </Button>
          </div>
        )}

        {/* Cycle History */}
        {cycles.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Cycle History</h3>
            
            <div className="space-y-4">
              {cycles.slice(0, 6).map((cycle, index) => (
                <div key={cycle.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">🌸</span>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {index === 0 && cycle.is_active ? 'Current Cycle' : `Cycle ${cycles.length - index}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Started {formatDate(cycle.cycle_start_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {cycle.is_active ? (
                        <span className="bg-mint-100 text-mint-800 px-2 py-1 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-gray-600">
                            Cycle: <span className="font-medium">{cycle.cycle_length} days</span>
                          </div>
                          <div className="text-gray-600">
                            Period: <span className="font-medium">{cycle.period_length} days</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {cycle.symptoms && cycle.symptoms.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Symptoms:</p>
                      <div className="flex flex-wrap gap-1">
                        {cycle.symptoms.map((symptom: string) => (
                          <span key={symptom} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cycle.notes && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                      <p className="text-sm text-gray-600">{cycle.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Period Form Modal */}
        {showStartForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Start New Period</h3>
                <button
                  onClick={() => setShowStartForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Period Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={periodStartDate}
                    onChange={(e) => setPeriodStartDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          symptoms.includes(symptom)
                            ? 'border-mint-500 bg-mint-50 text-mint-800'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-mint-500 resize-none"
                    placeholder="How are you feeling? Any additional notes..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={startNewCycle}
                    disabled={!periodStartDate}
                    className="flex-1 bg-mint-600 hover:bg-mint-700"
                  >
                    Start Period
                  </Button>
                  <Button
                    onClick={() => setShowStartForm(false)}
                    variant="outline"
                    className="flex-1 border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* End Period Form Modal */}
        {showEndForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">End Current Period</h3>
                <button
                  onClick={() => setShowEndForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Period End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={periodEndDate}
                    onChange={(e) => setPeriodEndDate(e.target.value)}
                    min={currentCycle?.cycle_start_date}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-mint-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional symptoms during period (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          symptoms.includes(symptom)
                            ? 'border-mint-500 bg-mint-50 text-mint-800'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="endNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Period notes (optional)
                  </label>
                  <textarea
                    id="endNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-mint-500 resize-none"
                    placeholder="How was this period? Any observations..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={endCurrentPeriod}
                    disabled={!periodEndDate}
                    className="flex-1 bg-mint-600 hover:bg-mint-700"
                  >
                    End Period
                  </Button>
                  <Button
                    onClick={() => setShowEndForm(false)}
                    variant="outline"
                    className="flex-1 border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-mint-500">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-mint-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Your Cycle Data is Private</h4>
              <p className="text-gray-600 text-sm">
                Your cycle information is kept completely private. If you've enabled cycle-aware insights for partners, 
                only general wellness suggestions are shared, never specific cycle details.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}