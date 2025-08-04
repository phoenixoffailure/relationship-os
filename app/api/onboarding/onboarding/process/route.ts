{
  ;`import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { userId, responses } = await req.json()

    // In a real application, this would involve:
    // 1. Storing the detailed onboarding responses (already handled by the client component).
    // 2. Using AI to process these responses to:
    //    - Identify key relationship patterns or needs.
    //    - Generate initial personalized insights or suggestions for the user.
    //    - Potentially set up initial relationship goals or communication profiles.

    console.log(\`Processing onboarding responses for user: \${userId}\`)

    const prompt = \`Analyze the following onboarding responses for a user and provide a high-level, constructive summary of their relationship goals and communication style.
    Do NOT reveal the raw responses, only synthesize them into actionable insights.
    Responses: \${JSON.stringify(responses)}\`

    const { text: aiSummary } = await generateText({
      model: openai('gpt-4o'),
      prompt: prompt,
      system: 'You are a helpful relationship AI assistant. Summarize user onboarding responses into actionable insights.',
    })

    // Example: Generate an initial insight based on onboarding
    const initialInsight = {
      title: 'Welcome Insight: Focus on Communication',
      description: \`Based on your onboarding, a key area for growth is communication. Consider practicing active listening. AI Summary: \${aiSummary}\`,
      type: 'suggestion',
      priority: 'medium',
      generated_for_user: userId,
      relationship_id: null, // This might be a general insight, not tied to a specific relationship yet
    }

    // Save this initial insight to the 'relationship_insights' table (or a dedicated 'user_insights' table)
    // const { data, error } = await supabase.from('relationship_insights').insert(initialInsight);

    return NextResponse.json({ message: 'Onboarding responses processed', initialInsight })
  } catch (error) {
    console.error('Error processing onboarding:', error)
    return NextResponse.json({ error: 'Failed to process onboarding responses' }, { status: 500 })
  }
}
`
}
