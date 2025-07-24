// src/lib/onboarding/enhanced-questions.ts
// Enhanced Onboarding Question Set for RelationshipOS Task 1.1

export interface OnboardingResponse {
  // Step 1: Love Languages Assessment (Enhanced)
  love_language_ranking?: string[]
  love_language_intensity?: Record<string, number>
  love_language_examples?: Record<string, string>

  // Step 2: Communication Style Profile (Enhanced)
  communication_approach?: string
  conflict_style?: string
  stress_response?: string
  expression_preferences?: Record<string, number>
  communication_timing?: string[]

  // Step 3: Intimacy Preferences (Enhanced)
  intimacy_priorities?: Record<string, number>
  intimacy_enhancers?: string[]
  intimacy_barriers?: string[]
  connection_frequency?: Record<string, string>

  // Step 4: Relationship Goals (Enhanced)
  primary_goals?: string[]
  goal_timeline?: string
  specific_challenges?: string
  relationship_values?: string[]
  success_metrics?: string

  // Step 5: Need Expression Patterns (New)
  expression_directness?: string
  expression_frequency?: string
  preferred_methods?: string[]
  need_categories_ranking?: Record<string, number>
  partner_reading_ability?: number
  successful_communication?: string
  communication_barriers?: string[]
}

export const enhancedOnboardingQuestions = {
  // STEP 1: LOVE LANGUAGES ASSESSMENT (Enhanced)
  step1: {
    title: "How You Give and Receive Love",
    subtitle: "Understanding your love languages helps us provide better partner insights",
    questions: [
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

  // STEP 2: COMMUNICATION STYLE PROFILE (Enhanced)
  step2: {
    title: "Your Communication Style",
    subtitle: "How you express yourself and handle relationship conversations",
    questions: [
      {
        id: "communication_approach",
        type: "single_choice",
        question: "Which best describes your primary communication style?",
        options: [
          { 
            value: "direct_assertive", 
            label: "Direct & Assertive", 
            description: "I say what I mean clearly and directly" 
          },
          { 
            value: "thoughtful_diplomatic", 
            label: "Thoughtful & Diplomatic", 
            description: "I choose my words carefully to avoid conflict" 
          },
          { 
            value: "emotional_expressive", 
            label: "Emotional & Expressive", 
            description: "I communicate through feelings and emotions" 
          },
          { 
            value: "analytical_logical", 
            label: "Analytical & Logical", 
            description: "I prefer facts, reasons, and structured discussions" 
          },
          { 
            value: "indirect_suggestive", 
            label: "Indirect & Suggestive", 
            description: "I hint at things and expect my partner to pick up cues" 
          }
        ],
        required: true
      },
      {
        id: "conflict_style",
        type: "single_choice",
        question: "When there's a disagreement, you tend to:",
        options: [
          { value: "address_immediately", label: "Address it immediately and directly" },
          { value: "need_time_process", label: "Need time to process before discussing" },
          { value: "avoid_until_necessary", label: "Avoid conflict unless absolutely necessary" },
          { value: "seek_compromise", label: "Immediately look for compromise solutions" },
          { value: "emotional_first", label: "Express emotions first, then work on solutions" }
        ],
        required: true
      },
      {
        id: "stress_response",
        type: "single_choice",
        question: "When stressed or overwhelmed, you:",
        options: [
          { value: "need_space", label: "Need space and alone time" },
          { value: "seek_support", label: "Seek comfort and support from partner" },
          { value: "become_solution_focused", label: "Become very solution-focused and practical" },
          { value: "need_reassurance", label: "Need extra reassurance and affection" },
          { value: "withdraw_temporarily", label: "Withdraw temporarily but communicate needs" }
        ],
        required: true
      },
      {
        id: "expression_preferences",
        type: "slider_group",
        question: "Rate your preferences (1-10):",
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

  // STEP 3: INTIMACY PREFERENCES (Enhanced)
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

  // STEP 4: RELATIONSHIP GOALS (Enhanced)
  step4: {
    title: "Your Relationship Goals & Vision",
    subtitle: "What you want to build and improve together",
    questions: [
      {
        id: "primary_goals",
        type: "multiple_choice",
        question: "What are your primary relationship goals? (Select up to 5)",
        maxSelections: 5,
        options: [
          { value: "improve_communication", label: "Improve communication skills" },
          { value: "deepen_intimacy", label: "Deepen emotional and physical intimacy" },
          { value: "resolve_conflicts", label: "Handle conflicts more constructively" },
          { value: "increase_appreciation", label: "Show more appreciation for each other" },
          { value: "balance_independence", label: "Balance togetherness with independence" },
          { value: "align_future_plans", label: "Align on future plans and goals" },
          { value: "improve_trust", label: "Build or rebuild trust" },
          { value: "enhance_romance", label: "Bring back romance and spark" },
          { value: "support_growth", label: "Support each other's personal growth" },
          { value: "manage_stress", label: "Better manage stress as a team" },
          { value: "improve_physical_intimacy", label: "Improve physical/sexual connection" },
          { value: "shared_activities", label: "Develop more shared interests/activities" }
        ],
        required: true
      },
      {
        id: "goal_timeline",
        type: "single_choice",
        question: "What's your primary timeline for seeing meaningful progress?",
        options: [
          { value: "3_months", label: "3 months - I want to see changes quickly" },
          { value: "6_months", label: "6 months - Steady, sustainable progress" },
          { value: "1_year", label: "1 year - Long-term transformation" },
          { value: "ongoing", label: "Ongoing - Continuous growth and improvement" }
        ],
        required: true
      },
      {
        id: "specific_challenges",
        type: "textarea",
        question: "What specific challenges or patterns would you like to change?",
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

  // STEP 5: NEED EXPRESSION PATTERNS (New - Critical for AI insights)
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
          { value: "immediately", label: "Immediately when I notice them" },
          { value: "daily_checkins", label: "During regular daily/weekly check-ins" },
          { value: "when_building", label: "When frustration starts building up" },
          { value: "when_necessary", label: "Only when absolutely necessary" },
          { value: "rarely", label: "I rarely express needs directly" }
        ],
        required: true
      },
      {
        id: "preferred_methods",
        type: "multiple_choice",
        question: "How do you prefer to communicate needs? (Select all that apply)",
        options: [
          { value: "face_to_face", label: "Face-to-face conversation" },
          { value: "text_message", label: "Text messages" },
          { value: "written_notes", label: "Written notes or letters" },
          { value: "through_actions", label: "Through actions/modeling behavior" },
          { value: "casual_hints", label: "Casual hints during regular conversation" },
          { value: "scheduled_talks", label: "During scheduled relationship discussions" },
          { value: "in_the_moment", label: "In the moment when needs arise" },
          { value: "after_processing", label: "After I've had time to process my thoughts" }
        ],
        required: true
      },
      {
        id: "need_categories_ranking",
        type: "ranking",
        question: "Rank which types of needs are hardest for you to express (1 = hardest, 6 = easiest):",
        options: [
          { value: "physical_affection", label: "Physical affection and intimacy needs" },
          { value: "emotional_support", label: "Emotional support and validation" },
          { value: "quality_time", label: "Need for more quality time together" },
          { value: "space_independence", label: "Need for space or independence" },
          { value: "appreciation", label: "Need for appreciation or recognition" },
          { value: "practical_support", label: "Practical help or support" }
        ],
        required: true
      },
      {
        id: "partner_reading_ability",
        type: "slider",
        question: "How well does your partner currently pick up on your needs without you stating them directly?",
        label: "Partner's current ability to read your needs",
        min: 1,
        max: 10,
        minLabel: "Never notices",
        maxLabel: "Always knows",
        required: true
      },
      {
        id: "successful_communication",
        type: "textarea",
        question: "Describe a time when your partner responded perfectly to one of your needs. What did they do?",
        placeholder: "e.g., 'I was stressed about work and instead of trying to fix it, they just held me and listened. They brought me tea and didn't pressure me to talk until I was ready.'",
        required: true
      },
      {
        id: "communication_barriers",
        type: "multiple_choice",
        question: "What makes it hard for you to express your needs? (Select all that apply)",
        options: [
          { value: "fear_rejection", label: "Fear of rejection or dismissal" },
          { value: "dont_want_burden", label: "Don't want to be a burden" },
          { value: "unclear_needs", label: "I'm not always clear on what I need" },
          { value: "past_bad_reactions", label: "Past negative reactions from partner" },
          { value: "timing_never_right", label: "The timing never feels right" },
          { value: "prefer_independence", label: "I prefer to handle things independently" },
          { value: "fear_conflict", label: "Worry it will cause conflict" },
          { value: "feel_selfish", label: "Feel selfish asking for things" },
          { value: "partner_stressed", label: "Partner seems too stressed/busy" },
          { value: "communication_style", label: "Our communication styles clash" }
        ],
        required: true
      }
    ]
  }
}

export default enhancedOnboardingQuestions