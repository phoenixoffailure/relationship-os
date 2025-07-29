// lib/onboarding/enhanced-questions.ts
// CORRECTED VERSION - Adds timeline fields to existing interface and uses existing question types

export interface OnboardingResponse {
  // NEW: Relationship Timeline Fields (for database)
  anniversary_date?: string
  relationship_start_date?: string
  relationship_duration_years?: number
  relationship_duration_months?: number

  // EXISTING: All your original fields preserved
  love_language_ranking?: string[]
  love_language_intensity?: Record<string, number>
  love_language_examples?: Record<string, string>
  communication_approach?: string
  conflict_style?: string
  stress_response?: string
  expression_preferences?: Record<string, number>
  communication_timing?: string[]
  intimacy_priorities?: Record<string, number>
  intimacy_enhancers?: string[]
  intimacy_barriers?: string[]
  connection_frequency?: Record<string, string>
  primary_goals?: string[]
  goal_timeline?: string
  specific_challenges?: string
  relationship_values?: string[]
  success_metrics?: string
  expression_directness?: string
  expression_frequency?: string
  preferred_methods?: string[]
  need_categories_ranking?: Record<string, number>
  partner_reading_ability?: number
  successful_communication?: string
  communication_barriers?: string[]
}

export const enhancedOnboardingQuestions = {
  // STEP 1: LOVE LANGUAGES + TIMELINE (using existing question types only)
  step1: {
    title: "Your Relationship & Love Languages", 
    subtitle: "Help us understand your relationship timeline and how you give/receive love",
    questions: [
      // TIMELINE QUESTIONS (using simple existing types)
      {
        id: "anniversary_date",
        type: "textarea",
        question: "What's your anniversary date? (Optional - enter in MM/DD/YYYY format)",
        placeholder: "e.g., 06/15/2020 or June 15, 2020",
        required: false,
        description: "This helps us provide better relationship stage insights. Enter any meaningful date - when you met, started dating, got married, etc."
      },
      {
        id: "relationship_duration_years",
        type: "slider",
        question: "How many years have you been together? (Optional)",
        min: 0,
        max: 50,
        minLabel: "Less than 1 year",
        maxLabel: "50+ years",
        required: false
      },
      
      // EXISTING LOVE LANGUAGE QUESTIONS (preserved exactly)
      {
        id: "love_language_ranking",
        type: "ranking",
        question: "Rank these love languages from most meaningful to you (1) to least meaningful (5):",
        options: [
          { 
            value: "words_of_affirmation", 
            label: "Words of Affirmation", 
            description: "Compliments, encouragement, verbal appreciation" 
          },
          { 
            value: "quality_time", 
            label: "Quality Time", 
            description: "Undivided attention, shared experiences, meaningful conversations" 
          },
          { 
            value: "receiving_gifts", 
            label: "Receiving Gifts", 
            description: "Thoughtful presents, symbols of love, surprise tokens" 
          },
          { 
            value: "acts_of_service", 
            label: "Acts of Service", 
            description: "Helpful actions, doing things for you, practical support" 
          },
          { 
            value: "physical_touch", 
            label: "Physical Touch", 
            description: "Hugs, kisses, holding hands, physical closeness" 
          }
        ],
        required: true
      },
      {
        id: "love_language_intensity",
        type: "slider_group",
        question: "Rate how much each love language matters to you (1-10):",
        sliders: [
          { key: "words_of_affirmation", label: "Words of Affirmation", min: 1, max: 10 },
          { key: "quality_time", label: "Quality Time", min: 1, max: 10 },
          { key: "receiving_gifts", label: "Receiving Gifts", min: 1, max: 10 },
          { key: "acts_of_service", label: "Acts of Service", min: 1, max: 10 },
          { key: "physical_touch", label: "Physical Touch", min: 1, max: 10 }
        ],
        required: true
      },
      {
        id: "love_language_examples",
        type: "textarea_group",
        question: "Give us specific examples:",
        textareas: [
          {
            key: "mostMeaningful",
            label: "Describe the most meaningful way someone has shown you love:",
            placeholder: "e.g., 'When my partner left encouraging notes in my lunch box every day during a stressful work period'"
          },
          {
            key: "leastMeaningful",
            label: "What gesture, while well-intentioned, doesn't resonate with you?",
            placeholder: "e.g., 'Expensive gifts feel impersonal to me - I'd rather have their time'"
          }
        ],
        required: true
      }
    ]
  },

  // ALL OTHER STEPS PRESERVED EXACTLY AS THEY WERE
  step2: {
    title: "Your Communication Style",
    subtitle: "How you express yourself and handle relationship conversations",
    questions: [
      {
        id: "communication_approach",
        type: "single_choice",
        question: "Which best describes your primary communication style?",
        options: [
          { value: "direct_logical", label: "Direct & Logical - I prefer clear, straightforward conversations" },
          { value: "gentle_emotional", label: "Gentle & Emotional - I lead with feelings and use a softer approach" },
          { value: "thoughtful_measured", label: "Thoughtful & Measured - I like to think before speaking and choose words carefully" },
          { value: "spontaneous_expressive", label: "Spontaneous & Expressive - I share thoughts and feelings as they come up" },
          { value: "practical_solution", label: "Practical & Solution-focused - I want to understand the problem and fix it" }
        ],
        required: true
      },
      {
        id: "conflict_style",
        type: "single_choice",
        question: "When there's tension or disagreement in your relationship, you typically:",
        options: [
          { value: "address_immediately", label: "Address it immediately - I want to resolve things right away" },
          { value: "need_time_process", label: "Need time to process - I prefer to think it through before discussing" },
          { value: "seek_understanding", label: "Seek understanding first - I want to understand their perspective before sharing mine" },
          { value: "focus_solutions", label: "Focus on solutions - I want to move quickly to 'how do we fix this?'" },
          { value: "avoid_unless_major", label: "Avoid unless major - I only address conflicts if they're really significant" }
        ],
        required: true
      },
      {
        id: "stress_response",
        type: "single_choice",
        question: "When you're stressed or overwhelmed, you tend to:",
        options: [
          { value: "seek_support", label: "Seek support - I want to talk it through with my partner" },
          { value: "withdraw_recharge", label: "Withdraw to recharge - I need space to process alone first" },
          { value: "stay_busy", label: "Stay busy - I deal with stress by keeping active and distracted" },
          { value: "need_physical_comfort", label: "Need physical comfort - I want hugs, touch, or physical reassurance" },
          { value: "problem_solve", label: "Problem-solve immediately - I want to identify solutions and take action" }
        ],
        required: true
      },
      {
        id: "expression_preferences",
        type: "slider_group",
        question: "Rate your preferences in conversations (1-10):",
        sliders: [
          { key: "directness", label: "Direct communication (vs. subtle hints)", min: 1, max: 10 },
          { key: "emotionalExpression", label: "Emotional expression (vs. logical discussion)", min: 1, max: 10 },
          { key: "needForProcessingTime", label: "Need processing time (vs. immediate discussion)", min: 1, max: 10 }
        ],
        required: true
      },
      {
        id: "communication_timing",
        type: "multiple_choice",
        question: "When do you communicate best? (Select all that apply)",
        options: [
          { value: "morning", label: "Morning conversations" },
          { value: "afternoon", label: "Afternoon check-ins" },
          { value: "evening", label: "Evening wind-down talks" },
          { value: "immediately", label: "In the moment when things arise" },
          { value: "when_calm", label: "Only when both people are calm" },
          { value: "scheduled", label: "During scheduled relationship talks" }
        ],
        required: true
      }
    ]
  },

  // Continue with steps 3, 4, 5 exactly as they were...
  step3: {
    title: "Intimacy & Connection Preferences",
    subtitle: "Understanding how you connect and what makes intimacy meaningful",
    questions: [
      {
        id: "intimacy_priorities",
        type: "slider_group",
        question: "Rate the importance of each type of intimacy in your relationship (1-10):",
        sliders: [
          { key: "physical", label: "Physical Intimacy (touch, affection, sexuality)", min: 1, max: 10 },
          { key: "emotional", label: "Emotional Intimacy (sharing feelings, vulnerability)", min: 1, max: 10 },
          { key: "intellectual", label: "Intellectual Intimacy (deep conversations, shared ideas)", min: 1, max: 10 },
          { key: "spiritual", label: "Spiritual Intimacy (shared values, meaning, growth)", min: 1, max: 10 },
          { key: "recreational", label: "Recreational Intimacy (fun, play, shared activities)", min: 1, max: 10 }
        ],
        required: true
      },
      {
        id: "intimacy_enhancers",
        type: "multiple_choice",
        question: "What actions from your partner make you feel most connected? (Select all that apply)",
        options: [
          { value: "undivided_attention", label: "Giving me undivided attention" },
          { value: "physical_affection", label: "Spontaneous physical affection" },
          { value: "deep_conversations", label: "Initiating deep, meaningful conversations" },
          { value: "shared_experiences", label: "Planning special shared experiences" },
          { value: "vulnerability", label: "Sharing their own vulnerabilities" },
          { value: "appreciation", label: "Expressing specific appreciation" },
          { value: "playfulness", label: "Being playful and lighthearted" },
          { value: "support", label: "Offering practical or emotional support" },
          { value: "surprise_gestures", label: "Thoughtful surprise gestures" },
          { value: "quality_time", label: "Prioritizing uninterrupted time together" }
        ],
        required: true
      },
      {
        id: "intimacy_barriers",
        type: "multiple_choice",
        question: "What tends to create distance or reduce intimacy? (Select all that apply)",
        options: [
          { value: "distractions", label: "Phone/technology distractions" },
          { value: "rushed_interactions", label: "Always feeling rushed" },
          { value: "criticism", label: "Criticism or judgment" },
          { value: "lack_of_appreciation", label: "Lack of appreciation or recognition" },
          { value: "physical_distance", label: "Physical distance or lack of touch" },
          { value: "superficial_conversations", label: "Only superficial conversations" },
          { value: "stress", label: "High stress or overwhelm" },
          { value: "routine", label: "Too much routine, not enough novelty" },
          { value: "unresolved_conflict", label: "Unresolved conflicts or tension" },
          { value: "exhaustion", label: "Physical or emotional exhaustion" }
        ],
        required: true
      },
      {
        id: "connection_frequency",
        type: "single_choice_group",
        question: "How often do you prefer these types of connection?",
        choices: [
          {
            key: "physicalAffection",
            label: "Physical affection (hugs, kisses, cuddling)",
            options: [
              { value: "multiple_daily", label: "Multiple times daily" },
              { value: "daily", label: "Daily" },
              { value: "few_times_week", label: "A few times per week" },
              { value: "weekly", label: "Weekly" },
              { value: "as_needed", label: "As needed/varies" }
            ]
          },
          {
            key: "deepConversations",
            label: "Deep, meaningful conversations",
            options: [
              { value: "daily", label: "Daily" },
              { value: "few_times_week", label: "A few times per week" },
              { value: "weekly", label: "Weekly" },
              { value: "bi_weekly", label: "Every couple weeks" },
              { value: "as_needed", label: "As needed/naturally" }
            ]
          },
          {
            key: "sharedActivities",
            label: "Shared activities or experiences",
            options: [
              { value: "daily", label: "Daily" },
              { value: "few_times_week", label: "A few times per week" },
              { value: "weekly", label: "Weekly" },
              { value: "bi_weekly", label: "Every couple weeks" },
              { value: "monthly", label: "Monthly" }
            ]
          },
          {
            key: "aloneTime",
            label: "Individual alone time",
            options: [
              { value: "daily", label: "Daily" },
              { value: "few_times_week", label: "A few times per week" },
              { value: "weekly", label: "Weekly" },
              { value: "as_needed", label: "As needed" },
              { value: "rarely", label: "Rarely needed" }
            ]
          }
        ],
        required: true
      }
    ]
  },

  step4: {
    title: "Your Relationship Goals & Vision",
    subtitle: "What you want to build and improve together",
    questions: [
      {
        id: "primary_goals",
        type: "multiple_choice",
        question: "What are your primary relationship goals? (Select all that apply)",
        options: [
          { value: "improve_communication", label: "Improve communication and understanding" },
          { value: "deepen_intimacy", label: "Deepen physical and emotional intimacy" },
          { value: "resolve_conflicts", label: "Handle conflicts more constructively" },
          { value: "build_trust", label: "Build or rebuild trust and security" },
          { value: "balance_independence", label: "Balance togetherness with individual growth" },
          { value: "strengthen_partnership", label: "Strengthen partnership and teamwork" },
          { value: "reignite_romance", label: "Reignite romance and spark" },
          { value: "navigate_challenges", label: "Navigate major life changes together" },
          { value: "prepare_future", label: "Prepare for future milestones (marriage, family, etc.)" },
          { value: "maintain_happiness", label: "Maintain current happiness and prevent issues" }
        ],
        required: true
      },
      {
        id: "goal_timeline",
        type: "single_choice",
        question: "What's your timeline for seeing meaningful progress?",
        options: [
          { value: "immediate", label: "Immediate (within 1-2 weeks)" },
          { value: "short_term", label: "Short-term (1-3 months)" },
          { value: "medium_term", label: "Medium-term (3-6 months)" },
          { value: "long_term", label: "Long-term (6+ months)" },
          { value: "ongoing", label: "Ongoing process with no specific timeline" }
        ],
        required: true
      },
      {
        id: "specific_challenges",
        type: "textarea",
        question: "Describe your biggest relationship challenge right now:",
        placeholder: "e.g., 'We tend to avoid difficult conversations and let resentment build up' or 'We're great friends but struggle with physical intimacy'",
        required: true
      },
      {
        id: "relationship_values",
        type: "multiple_choice",
        question: "What values are most important in your relationship? (Select all that apply)",
        options: [
          { value: "honesty", label: "Complete honesty and transparency" },
          { value: "loyalty", label: "Loyalty and commitment" },
          { value: "growth", label: "Personal and relationship growth" },
          { value: "fun", label: "Fun and playfulness" },
          { value: "stability", label: "Stability and security" },
          { value: "adventure", label: "Adventure and new experiences" },
          { value: "independence", label: "Maintaining individual independence" },
          { value: "family", label: "Family and future planning" },
          { value: "spirituality", label: "Shared spiritual/philosophical beliefs" },
          { value: "success", label: "Supporting each other's success" },
          { value: "creativity", label: "Creativity and self-expression" },
          { value: "service", label: "Service to others/community" }
        ],
        required: true
      },
      {
        id: "success_metrics",
        type: "textarea",
        question: "How will you know your relationship is thriving? What would success look like?",
        placeholder: "e.g., 'We handle disagreements without shutting down, we prioritize time together weekly, we both feel heard and appreciated'",
        required: true
      }
    ]
  },

  step5: {
    title: "How You Express Your Needs",
    subtitle: "This helps us provide better suggestions to your partner",
    questions: [
      {
        id: "expression_directness",
        type: "single_choice",
        question: "When you have a need or want something from your partner, you typically:",
        options: [
          { value: "very_direct", label: "State it directly: 'I need more affection from you'" },
          { value: "somewhat_direct", label: "Mention it clearly but gently: 'I've been feeling like we need more connection'" },
          { value: "indirect", label: "Drop hints or bring it up indirectly: 'I miss how we used to cuddle more'" },
          { value: "very_indirect", label: "Hope they notice without saying anything directly" },
          { value: "varies", label: "It depends on the situation and my mood" }
        ],
        required: true
      },
      {
        id: "expression_frequency",
        type: "single_choice",
        question: "How often do you express your relationship needs?",
        options: [
          { value: "very_often", label: "Very often - I regularly share what I need" },
          { value: "sometimes", label: "Sometimes - when something is really important to me" },
          { value: "rarely", label: "Rarely - I usually keep my needs to myself" },
          { value: "only_when_upset", label: "Only when I'm upset or frustrated" },
          { value: "depends", label: "It depends on the type of need" }
        ],
        required: true
      },
      {
        id: "preferred_methods",
        type: "multiple_choice",
        question: "How do you prefer to communicate important things? (Select all that apply)",
        options: [
          { value: "face_to_face", label: "Face-to-face conversations" },
          { value: "during_activities", label: "While doing activities together (walks, car rides)" },
          { value: "text_message", label: "Text messages" },
          { value: "written_notes", label: "Written notes or letters" },
          { value: "scheduled_talks", label: "Scheduled relationship check-ins" },
          { value: "spontaneous", label: "Spontaneous moments when it feels right" }
        ],
        required: true
      },
      {
        id: "need_categories_ranking",
        type: "slider_group",
        question: "Rate how difficult it is for you to express these types of needs (1-10, where 10 = very difficult):",
        sliders: [
          { key: "physical_needs", label: "Physical needs (touch, affection, intimacy)", min: 1, max: 10 },
          { key: "emotional_needs", label: "Emotional needs (support, understanding, validation)", min: 1, max: 10 },
          { key: "practical_needs", label: "Practical needs (help with tasks, shared responsibilities)", min: 1, max: 10 },
          { key: "social_needs", label: "Social needs (time with friends, social activities)", min: 1, max: 10 },
          { key: "personal_space", label: "Personal space and alone time", min: 1, max: 10 }
        ],
        required: true
      },
      {
        id: "partner_reading_ability",
        type: "slider",
        question: "How well does your partner typically pick up on your needs without you stating them directly?",
        min: 1,
        max: 10,
        minLabel: "Never notices",
        maxLabel: "Always knows what I need",
        required: true
      },
      {
        id: "successful_communication",
        type: "textarea",
        question: "Describe a time when you successfully communicated a need to your partner:",
        placeholder: "e.g., 'I told them I needed more help with household tasks, and they started doing dishes without me asking'",
        required: false
      },
      {
        id: "communication_barriers",
        type: "multiple_choice",
        question: "What makes it harder for you to express your needs? (Select all that apply)",
        options: [
          { value: "fear_rejection", label: "Fear of rejection or dismissal" },
          { value: "dont_want_burden", label: "Don't want to burden them" },
          { value: "fear_conflict", label: "Fear it will cause conflict" },
          { value: "unclear_needs", label: "I'm not always clear on what I need" },
          { value: "timing_never_right", label: "The timing never feels right" },
          { value: "past_bad_experiences", label: "Past experiences where they didn't respond well" },
          { value: "pride", label: "Pride - I want them to figure it out themselves" },
          { value: "cultural_background", label: "Cultural or family background about expressing needs" }
        ],
        required: true
      }
    ]
  }
}

// Helper function to determine relationship stage from timeline data
export function calculateRelationshipStage(timelineData: {
  anniversary_date?: string
  relationship_start_date?: string
  relationship_duration_years?: number
  relationship_duration_months?: number
}): 'new' | 'developing' | 'established' | 'longterm' {
  let monthsOld = 0

  // Priority 1: Use duration data if available
  if (timelineData.relationship_duration_years || timelineData.relationship_duration_months) {
    monthsOld = (timelineData.relationship_duration_years || 0) * 12 + (timelineData.relationship_duration_months || 0)
  }
  // Priority 2: Use anniversary date if available
  else if (timelineData.anniversary_date) {
    const anniversaryDate = new Date(timelineData.anniversary_date)
    monthsOld = (new Date().getTime() - anniversaryDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  }
  // Priority 3: Use start date if available
  else if (timelineData.relationship_start_date) {
    const startDate = new Date(timelineData.relationship_start_date)
    monthsOld = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  }

  // Categorize based on months
  if (monthsOld < 6) return 'new'
  if (monthsOld < 24) return 'developing'  
  if (monthsOld < 60) return 'established'
  return 'longterm'
}