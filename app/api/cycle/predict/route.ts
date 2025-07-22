{
  ;`import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { userId, cycleId } = await req.json()

    // In a real application, this would involve:
    // 1. Fetching the user's menstrual_cycles data.
    // 2. Using a prediction model (could be simple date math or more complex AI)
    //    to determine current and upcoming phases.
    // 3. Generating predicted mood patterns and anonymized partner suggestions
    //    based on typical phase characteristics and user's historical data (if available).

    console.log(\`Predicting cycle phases and insights for user: \${userId}, cycle: \${cycleId}\`)

    const currentPhase = ['menstrual', 'follicular', 'ovulation', 'luteal'][Math.floor(Math.random() * 4)]
    const predictedMood = \`During the \${currentPhase} phase, you might feel \${currentPhase === 'luteal' ? 'more introspective and sensitive' : 'energetic and social'}.\`

    const { text: partnerSuggestion } = await generateText({
      model: openai('gpt-4o'),
      prompt: \`Based on the \${currentPhase} phase, provide a constructive, anonymized suggestion for a partner.
      Example: "Your partner might appreciate extra space this week."\`,
      system: 'You are a helpful relationship AI assistant. Provide constructive, high-level, and anonymized insights.',
    })

    // Save these insights to the 'cycle_insights' table
    // const { data, error } = await supabase.from('cycle_insights').insert({
    //   user_id: userId,
    //   cycle_id: cycleId,
    //   phase: currentPhase,
    //   predicted_mood: { text: predictedMood },
    //   partner_suggestions: { text: partnerSuggestion },
    // });

    return NextResponse.json({
      message: 'Cycle prediction and insights generated',
      currentPhase,
      predictedMood,
      partnerSuggestion,
    })
  } catch (error) {
    console.error('Error predicting cycle:', error)
    return NextResponse.json({ error: 'Failed to predict cycle' }, { status: 500 })
  }
}
`
}
