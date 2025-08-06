// FILE LOCATION: components/onboarding/RelationshipOnboarding.tsx  
// INSTRUCTION: Replace entire file content with this

'use client';

import React, { useState } from 'react';
import { Users, Heart, Home, Briefcase, UserPlus, Calendar, MessageSquare, Target, ChevronRight } from 'lucide-react';

// Type definitions
interface RelationshipProfile {
  relationship_id: string;
  relationship_type: string;
  perceived_closeness: number;
  communication_frequency: string;
  preferred_interaction_style: string;
  relationship_expectations: {
    primary_goal: string;
    boundaries: string[];
    growth_areas: string[];
  };
  interaction_preferences: {
    preferred_activities: string[];
    communication_channels: string[];
    quality_time_style: string;
  };
}

interface RelationshipOnboardingProps {
  relationshipId: string;
  partnerName?: string;
}

interface StepProps {
  profile: RelationshipProfile;
  setProfile: React.Dispatch<React.SetStateAction<RelationshipProfile>>;
  partnerName: string;
}

const RelationshipOnboarding: React.FC<RelationshipOnboardingProps> = ({ relationshipId, partnerName = "Your Connection" }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [relationshipProfile, setRelationshipProfile] = useState<RelationshipProfile>({
    relationship_id: relationshipId,
    relationship_type: '',
    perceived_closeness: 5,
    communication_frequency: '',
    preferred_interaction_style: '',
    relationship_expectations: {
      primary_goal: '',
      boundaries: [],
      growth_areas: []
    },
    interaction_preferences: {
      preferred_activities: [],
      communication_channels: [],
      quality_time_style: ''
    }
  });

  const steps = [
    {
      title: "Relationship Type",
      component: <RelationshipTypeSelection profile={relationshipProfile} setProfile={setRelationshipProfile} partnerName={partnerName} />
    },
    {
      title: "Connection Level",
      component: <ClosenessAssessment profile={relationshipProfile} setProfile={setRelationshipProfile} partnerName={partnerName} />
    },
    {
      title: "Communication Patterns",
      component: <CommunicationFrequency profile={relationshipProfile} setProfile={setRelationshipProfile} partnerName={partnerName} />
    },
    {
      title: "Interaction Preferences",
      component: <InteractionStyle profile={relationshipProfile} setProfile={setRelationshipProfile} partnerName={partnerName} />
    },
    {
      title: "Expectations & Goals",
      component: <RelationshipExpectations profile={relationshipProfile} setProfile={setRelationshipProfile} partnerName={partnerName} />
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save relationship profile
      console.log('Saving relationship profile:', relationshipProfile);
      try {
        const response = await fetch('/api/onboarding/relationship', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(relationshipProfile)
        });
        
        if (response.ok) {
          // Redirect to dashboard or next relationship
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Error saving relationship profile:', error);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Setting Up Your Connection with {partnerName}
          </h1>
          <p className="text-gray-600">
            Help us understand this unique relationship
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-12 rounded-full transition-all ${
                  index <= currentStep ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {steps[currentStep].title}
          </h2>
          
          <div className="min-h-[400px]">
            {steps[currentStep].component}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="ml-auto flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const RelationshipTypeSelection: React.FC<StepProps> = ({ profile, setProfile, partnerName }) => {
  const types = [
    {
      value: 'romantic',
      label: 'Romantic Partner',
      icon: <Heart className="w-8 h-8" />,
      description: 'Intimate romantic relationship'
    },
    {
      value: 'family',
      label: 'Family Member',
      icon: <Home className="w-8 h-8" />,
      description: 'Parent, sibling, child, or extended family'
    },
    {
      value: 'friend',
      label: 'Friend',
      icon: <Users className="w-8 h-8" />,
      description: 'Close friend or social connection'
    },
    {
      value: 'work',
      label: 'Work Relationship',
      icon: <Briefcase className="w-8 h-8" />,
      description: 'Colleague, manager, or professional contact'
    },
    {
      value: 'other',
      label: 'Other',
      icon: <UserPlus className="w-8 h-8" />,
      description: 'Mentor, coach, or other connection type'
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-6">
        What type of relationship do you have with {partnerName}?
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map((type) => (
          <label
            key={type.value}
            className={`block p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              profile.relationship_type === type.value
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="relationship_type"
              value={type.value}
              checked={profile.relationship_type === type.value}
              onChange={(e) => setProfile({...profile, relationship_type: e.target.value})}
              className="sr-only"
            />
            <div className="flex flex-col items-center text-center">
              <div className={`mb-3 ${profile.relationship_type === type.value ? 'text-purple-500' : 'text-gray-400'}`}>
                {type.icon}
              </div>
              <p className="font-semibold text-gray-800">{type.label}</p>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

const ClosenessAssessment: React.FC<StepProps> = ({ profile, setProfile, partnerName }) => {
  const closenessDescriptions: Record<number, string> = {
    1: "Very distant - minimal emotional connection",
    2: "Distant - limited emotional connection",
    3: "Somewhat distant - occasional connection",
    4: "Neutral - moderate connection",
    5: "Moderate - balanced connection",
    6: "Somewhat close - regular connection",
    7: "Close - strong connection",
    8: "Very close - deep connection",
    9: "Extremely close - profound connection",
    10: "Inseparable - maximum closeness"
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        How emotionally close do you feel to {partnerName} in this relationship?
      </p>
      
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Distant</span>
          <span>Extremely Close</span>
        </div>
        
        <input
          type="range"
          min="1"
          max="10"
          value={profile.perceived_closeness}
          onChange={(e) => setProfile({...profile, perceived_closeness: parseInt(e.target.value)})}
          className="w-full"
        />
        
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{profile.perceived_closeness}</div>
          <p className="text-sm text-gray-600 mt-2">{closenessDescriptions[profile.perceived_closeness]}</p>
        </div>
      </div>

      {/* Visual representation */}
      <div className="flex justify-center space-x-2 mt-8">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`h-8 w-8 rounded-full transition-all ${
              i < profile.perceived_closeness
                ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const CommunicationFrequency: React.FC<StepProps> = ({ profile, setProfile, partnerName }) => {
  const frequencies = [
    {
      value: 'daily',
      label: 'Daily',
      description: 'We connect every day',
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      value: 'weekly',
      label: 'Weekly',
      description: 'We connect several times a week',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      value: 'monthly',
      label: 'Monthly',
      description: 'We connect a few times a month',
      icon: <Calendar className="w-6 h-6" />
    },
    {
      value: 'rarely',
      label: 'Rarely',
      description: 'We connect occasionally',
      icon: <Calendar className="w-6 h-6" />
    }
  ];

  const channels = [
    { id: 'in_person', label: 'In Person' },
    { id: 'phone_call', label: 'Phone Calls' },
    { id: 'video_call', label: 'Video Calls' },
    { id: 'text_message', label: 'Text Messages' },
    { id: 'social_media', label: 'Social Media' },
    { id: 'email', label: 'Email' }
  ];

  const toggleChannel = (channelId: string) => {
    const currentChannels = profile.interaction_preferences.communication_channels || [];
    const newChannels = currentChannels.includes(channelId)
      ? currentChannels.filter((c: string) => c !== channelId)
      : [...currentChannels, channelId];
    
    setProfile({
      ...profile,
      interaction_preferences: {
        ...profile.interaction_preferences,
        communication_channels: newChannels
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-600 mb-4">
          How often do you typically communicate with {partnerName}?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {frequencies.map((freq) => (
            <label
              key={freq.value}
              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                profile.communication_frequency === freq.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="communication_frequency"
                value={freq.value}
                checked={profile.communication_frequency === freq.value}
                onChange={(e) => setProfile({...profile, communication_frequency: e.target.value})}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className="text-purple-500 mr-3">{freq.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800">{freq.label}</p>
                  <p className="text-xs text-gray-600">{freq.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-gray-600 mb-4">
          How do you prefer to communicate? (Select all that apply)
        </p>
        <div className="grid grid-cols-2 gap-3">
          {channels.map((channel) => (
            <label
              key={channel.id}
              className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                profile.interaction_preferences.communication_channels.includes(channel.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={profile.interaction_preferences.communication_channels.includes(channel.id)}
                onChange={() => toggleChannel(channel.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="text-gray-800">{channel.label}</span>
                {profile.interaction_preferences.communication_channels.includes(channel.id) && (
                  <span className="text-purple-500">✓</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const InteractionStyle: React.FC<StepProps> = ({ profile, setProfile, partnerName }) => {
  type RelationshipType = 'romantic' | 'family' | 'friend' | 'work' | 'other';
  
  const activities: Record<RelationshipType, Array<{id: string; label: string}>> = {
    romantic: [
      { id: 'dates', label: 'Romantic dates' },
      { id: 'physical_affection', label: 'Physical affection' },
      { id: 'deep_conversations', label: 'Deep conversations' },
      { id: 'shared_hobbies', label: 'Shared hobbies' },
      { id: 'adventures', label: 'New adventures' },
      { id: 'quiet_time', label: 'Quiet time together' }
    ],
    family: [
      { id: 'meals', label: 'Family meals' },
      { id: 'traditions', label: 'Family traditions' },
      { id: 'support', label: 'Emotional support' },
      { id: 'celebrations', label: 'Celebrations' },
      { id: 'helping', label: 'Helping each other' },
      { id: 'catching_up', label: 'Regular catch-ups' }
    ],
    friend: [
      { id: 'hangouts', label: 'Casual hangouts' },
      { id: 'activities', label: 'Shared activities' },
      { id: 'venting', label: 'Venting sessions' },
      { id: 'adventures', label: 'Adventures' },
      { id: 'celebrations', label: 'Celebrating wins' },
      { id: 'support', label: 'Mutual support' }
    ],
    work: [
      { id: 'collaboration', label: 'Project collaboration' },
      { id: 'mentoring', label: 'Mentoring' },
      { id: 'brainstorming', label: 'Brainstorming' },
      { id: 'feedback', label: 'Feedback sessions' },
      { id: 'social', label: 'Social interactions' },
      { id: 'professional', label: 'Professional growth' }
    ],
    other: [
      { id: 'learning', label: 'Learning together' },
      { id: 'support', label: 'Mutual support' },
      { id: 'activities', label: 'Shared activities' },
      { id: 'conversations', label: 'Meaningful talks' },
      { id: 'growth', label: 'Personal growth' },
      { id: 'connection', label: 'Building connection' }
    ]
  };

  const currentActivities = activities[profile.relationship_type as RelationshipType] || activities.other;

  const toggleActivity = (activityId: string) => {
    const current = profile.interaction_preferences.preferred_activities || [];
    const updated = current.includes(activityId)
      ? current.filter((a: string) => a !== activityId)
      : [...current, activityId];
    
    setProfile({
      ...profile,
      interaction_preferences: {
        ...profile.interaction_preferences,
        preferred_activities: updated
      }
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        What types of interactions strengthen your connection with {partnerName}?
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {currentActivities.map((activity) => (
          <label
            key={activity.id}
            className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
              profile.interaction_preferences.preferred_activities.includes(activity.id)
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={profile.interaction_preferences.preferred_activities.includes(activity.id)}
              onChange={() => toggleActivity(activity.id)}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <span className="text-gray-800">{activity.label}</span>
              {profile.interaction_preferences.preferred_activities.includes(activity.id) && (
                <span className="text-purple-500">✓</span>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-gray-700 mb-2">
          Describe your ideal way of spending quality time with {partnerName}:
        </label>
        <textarea
          value={profile.interaction_preferences.quality_time_style || ''}
          onChange={(e) => setProfile({
            ...profile,
            interaction_preferences: {
              ...profile.interaction_preferences,
              quality_time_style: e.target.value
            }
          })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
          placeholder="e.g., 'I love having deep conversations over coffee' or 'Working on projects together energizes me'"
        />
      </div>
    </div>
  );
};

const RelationshipExpectations: React.FC<StepProps> = ({ profile, setProfile, partnerName }) => {
  type RelationshipType = 'romantic' | 'family' | 'friend' | 'work' | 'other';
  
  const goalOptions: Record<RelationshipType, Array<{value: string; label: string}>> = {
    romantic: [
      { value: 'deepen_intimacy', label: 'Deepen emotional and physical intimacy' },
      { value: 'build_future', label: 'Build a future together' },
      { value: 'improve_communication', label: 'Improve our communication' },
      { value: 'maintain_spark', label: 'Keep the spark alive' }
    ],
    family: [
      { value: 'strengthen_bond', label: 'Strengthen our family bond' },
      { value: 'heal_wounds', label: 'Heal past wounds' },
      { value: 'create_memories', label: 'Create positive memories' },
      { value: 'provide_support', label: 'Be there for each other' }
    ],
    friend: [
      { value: 'deepen_friendship', label: 'Deepen our friendship' },
      { value: 'have_fun', label: 'Have more fun together' },
      { value: 'mutual_growth', label: 'Support each other\'s growth' },
      { value: 'stay_connected', label: 'Stay connected despite life changes' }
    ],
    work: [
      { value: 'collaborate_better', label: 'Collaborate more effectively' },
      { value: 'mutual_respect', label: 'Build mutual respect' },
      { value: 'professional_growth', label: 'Support professional growth' },
      { value: 'positive_environment', label: 'Create positive work environment' }
    ],
    other: [
      { value: 'build_connection', label: 'Build meaningful connection' },
      { value: 'mutual_support', label: 'Provide mutual support' },
      { value: 'personal_growth', label: 'Foster personal growth' },
      { value: 'maintain_boundaries', label: 'Maintain healthy boundaries' }
    ]
  };

  const boundaries = [
    { id: 'personal_space', label: 'Respect for personal space' },
    { id: 'time_boundaries', label: 'Respect for time and availability' },
    { id: 'emotional_boundaries', label: 'Emotional boundaries' },
    { id: 'privacy', label: 'Privacy and confidentiality' },
    { id: 'values', label: 'Respect for different values' },
    { id: 'communication', label: 'Communication preferences' }
  ];

  const currentGoals = goalOptions[profile.relationship_type as RelationshipType] || goalOptions.other;

  const toggleBoundary = (boundaryId: string) => {
    const current = profile.relationship_expectations.boundaries || [];
    const updated = current.includes(boundaryId)
      ? current.filter((b: string) => b !== boundaryId)
      : [...current, boundaryId];
    
    setProfile({
      ...profile,
      relationship_expectations: {
        ...profile.relationship_expectations,
        boundaries: updated
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-600 mb-4">
          What's your primary goal for this relationship with {partnerName}?
        </p>
        <div className="space-y-3">
          {currentGoals.map((goal) => (
            <label
              key={goal.value}
              className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                profile.relationship_expectations.primary_goal === goal.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="primary_goal"
                value={goal.value}
                checked={profile.relationship_expectations.primary_goal === goal.value}
                onChange={(e) => setProfile({
                  ...profile,
                  relationship_expectations: {
                    ...profile.relationship_expectations,
                    primary_goal: e.target.value
                  }
                })}
                className="sr-only"
              />
              <div className="flex items-center">
                <Target className="w-5 h-5 text-purple-500 mr-3" />
                <span className="text-gray-800">{goal.label}</span>
                {profile.relationship_expectations.primary_goal === goal.value && (
                  <span className="ml-auto text-purple-500">✓</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-gray-600 mb-4">
          What boundaries are important in this relationship? (Select all that apply)
        </p>
        <div className="grid grid-cols-1 gap-2">
          {boundaries.map((boundary) => (
            <label
              key={boundary.id}
              className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                profile.relationship_expectations.boundaries.includes(boundary.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={profile.relationship_expectations.boundaries.includes(boundary.id)}
                onChange={() => toggleBoundary(boundary.id)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="text-gray-800">{boundary.label}</span>
                {profile.relationship_expectations.boundaries.includes(boundary.id) && (
                  <span className="text-purple-500">✓</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelationshipOnboarding;