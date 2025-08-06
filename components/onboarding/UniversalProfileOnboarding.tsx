// FILE LOCATION: components/onboarding/UniversalProfileOnboarding.tsx
// INSTRUCTION: Replace entire file content with this

'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, User, Heart, MessageCircle, Shield, Target } from 'lucide-react';

// Type definitions
interface UniversalProfile {
  inclusion_need: number;
  control_need: number;
  affection_need: number;
  communication_directness: string;
  communication_assertiveness: string;
  communication_context: string;
  support_preference: string;
  conflict_style: string;
  attachment_responses: Array<{id: string, value: string}>;
}

interface StepProps {
  profile: UniversalProfile;
  setProfile: React.Dispatch<React.SetStateAction<UniversalProfile>>;
}

const UniversalProfileOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UniversalProfile>({
    // FIRO Theory Dimensions
    inclusion_need: 5,
    control_need: 5,
    affection_need: 5,
    
    // Communication Style
    communication_directness: '',
    communication_assertiveness: '',
    communication_context: '',
    
    // Support Preferences
    support_preference: '',
    
    // Conflict Style
    conflict_style: '',
    
    // Attachment Style (will be inferred)
    attachment_responses: []
  });

  const steps = [
    {
      title: "Welcome to Your Universal Profile",
      subtitle: "Let's understand your fundamental interpersonal needs",
      component: <WelcomeStep />
    },
    {
      title: "Interpersonal Needs",
      subtitle: "Based on FIRO Theory - Understanding your core needs",
      component: <FIROAssessment profile={profile} setProfile={setProfile} />
    },
    {
      title: "Communication Style",
      subtitle: "How you prefer to express yourself and connect",
      component: <CommunicationStyle profile={profile} setProfile={setProfile} />
    },
    {
      title: "Support Preferences",
      subtitle: "How you prefer to give and receive support",
      component: <SupportPreferences profile={profile} setProfile={setProfile} />
    },
    {
      title: "Conflict Approach",
      subtitle: "Understanding your conflict resolution style",
      component: <ConflictStyle profile={profile} setProfile={setProfile} />
    },
    {
      title: "Reflection Questions",
      subtitle: "Help us understand your attachment patterns",
      component: <AttachmentInference profile={profile} setProfile={setProfile} />
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save profile
      console.log('Saving universal profile:', profile);
      try {
        const response = await fetch('/api/onboarding/universal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        
        if (response.ok) {
          // Redirect or show success
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{steps[currentStep].title}</h2>
          <p className="text-gray-600 mb-6">{steps[currentStep].subtitle}</p>
          
          <div className="min-h-[400px]">
            {steps[currentStep].component}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep = () => (
  <div className="text-center py-12">
    <div className="mb-8">
      <User className="w-24 h-24 mx-auto text-blue-500" />
    </div>
    <h3 className="text-xl font-semibold mb-4">Your Universal Relationship Intelligence Profile</h3>
    <p className="text-gray-600 mb-6">
      This profile will help us understand your fundamental interpersonal needs and preferences 
      across ALL your relationships - romantic, family, friends, and work connections.
    </p>
    <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
      <p className="text-sm text-blue-800">
        <strong>Privacy First:</strong> Your responses are never shared directly. 
        They're used to generate personalized insights and suggestions that respect your unique style.
      </p>
    </div>
  </div>
);

const FIROAssessment: React.FC<StepProps> = ({ profile, setProfile }) => {
  const dimensions = [
    {
      key: 'inclusion_need' as keyof UniversalProfile,
      title: 'Inclusion',
      description: 'How much do you need to feel included and connected in your relationships?',
      low: 'I prefer independence',
      high: 'I need strong connection'
    },
    {
      key: 'control_need' as keyof UniversalProfile,
      title: 'Control',
      description: 'How much structure and influence do you need in your relationships?',
      low: 'I go with the flow',
      high: 'I need clear structure'
    },
    {
      key: 'affection_need' as keyof UniversalProfile,
      title: 'Affection',
      description: 'How much emotional closeness and intimacy do you seek?',
      low: 'I prefer some distance',
      high: 'I need deep closeness'
    }
  ];

  return (
    <div className="space-y-8">
      {dimensions.map((dim) => (
        <div key={dim.key} className="space-y-3">
          <h4 className="font-semibold text-gray-800">{dim.title}</h4>
          <p className="text-sm text-gray-600">{dim.description}</p>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 w-32">{dim.low}</span>
            <input
              type="range"
              min="1"
              max="10"
              value={profile[dim.key] as number}
              onChange={(e) => setProfile({...profile, [dim.key]: parseInt(e.target.value)})}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-32 text-right">{dim.high}</span>
            <span className="font-bold text-blue-600 w-8 text-center">{profile[dim.key] as number}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const CommunicationStyle: React.FC<StepProps> = ({ profile, setProfile }) => {
  const styles = {
    directness: [
      { value: 'direct', label: 'Direct', description: 'I say what I mean clearly and straightforwardly' },
      { value: 'indirect', label: 'Indirect', description: 'I prefer hints and subtle communication' }
    ],
    assertiveness: [
      { value: 'passive', label: 'Passive', description: 'I tend to avoid confrontation' },
      { value: 'assertive', label: 'Assertive', description: 'I express needs while respecting others' },
      { value: 'aggressive', label: 'Aggressive', description: 'I strongly advocate for my needs' }
    ],
    context: [
      { value: 'high-context', label: 'High Context', description: 'I rely on context and non-verbal cues' },
      { value: 'low-context', label: 'Low Context', description: 'I prefer explicit verbal communication' }
    ]
  };

  return (
    <div className="space-y-6">
      {Object.entries(styles).map(([key, options]) => (
        <div key={key} className="space-y-3">
          <h4 className="font-semibold text-gray-800 capitalize">{key}</h4>
          <div className="space-y-2">
            {options.map((option) => (
              <label
                key={option.value}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  profile[`communication_${key}` as keyof UniversalProfile] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`communication_${key}`}
                  value={option.value}
                  checked={profile[`communication_${key}` as keyof UniversalProfile] === option.value}
                  onChange={(e) => setProfile({...profile, [`communication_${key}`]: e.target.value})}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  {profile[`communication_${key}` as keyof UniversalProfile] === option.value && (
                    <div className="ml-3 text-blue-500">✓</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const SupportPreferences: React.FC<StepProps> = ({ profile, setProfile }) => {
  const preferences = [
    {
      value: 'instrumental',
      label: 'Instrumental Support',
      description: 'I prefer practical solutions, advice, and concrete help',
      icon: <Target className="w-8 h-8" />
    },
    {
      value: 'emotional',
      label: 'Emotional Support',
      description: 'I prefer validation, empathy, and emotional presence',
      icon: <Heart className="w-8 h-8" />
    },
    {
      value: 'balanced',
      label: 'Balanced Support',
      description: 'I appreciate both practical and emotional support equally',
      icon: <MessageCircle className="w-8 h-8" />
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">
        When facing challenges, what type of support helps you most?
      </p>
      {preferences.map((pref) => (
        <label
          key={pref.value}
          className={`block p-6 rounded-lg border-2 cursor-pointer transition-all ${
            profile.support_preference === pref.value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="support_preference"
            value={pref.value}
            checked={profile.support_preference === pref.value}
            onChange={(e) => setProfile({...profile, support_preference: e.target.value})}
            className="sr-only"
          />
          <div className="flex items-center">
            <div className="text-blue-500 mr-4">{pref.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{pref.label}</p>
              <p className="text-sm text-gray-600 mt-1">{pref.description}</p>
            </div>
            {profile.support_preference === pref.value && (
              <div className="ml-3 text-blue-500 text-xl">✓</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

const ConflictStyle: React.FC<StepProps> = ({ profile, setProfile }) => {
  const styles = [
    {
      value: 'competing',
      label: 'Competing',
      description: 'I stand firm on my position and advocate strongly for my needs'
    },
    {
      value: 'collaborating',
      label: 'Collaborating',
      description: 'I work to find win-win solutions that satisfy everyone'
    },
    {
      value: 'avoiding',
      label: 'Avoiding',
      description: 'I prefer to sidestep conflicts when possible'
    },
    {
      value: 'accommodating',
      label: 'Accommodating',
      description: 'I often prioritize others\' needs over my own'
    },
    {
      value: 'compromising',
      label: 'Compromising',
      description: 'I seek middle ground where everyone gives a little'
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">
        When conflicts arise in your relationships, which approach feels most natural to you?
      </p>
      {styles.map((style) => (
        <label
          key={style.value}
          className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
            profile.conflict_style === style.value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="conflict_style"
            value={style.value}
            checked={profile.conflict_style === style.value}
            onChange={(e) => setProfile({...profile, conflict_style: e.target.value})}
            className="sr-only"
          />
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{style.label}</p>
              <p className="text-sm text-gray-600 mt-1">{style.description}</p>
            </div>
            {profile.conflict_style === style.value && (
              <div className="ml-3 text-blue-500">✓</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

const AttachmentInference: React.FC<StepProps> = ({ profile, setProfile }) => {
  const scenarios = [
    {
      id: 'separation',
      question: 'When someone close to you needs space or time alone, you typically:',
      options: [
        { value: 'anxious', label: 'Feel worried they might be pulling away from me' },
        { value: 'secure', label: 'Understand they need space and feel comfortable with it' },
        { value: 'avoidant', label: 'Feel relieved to have some space myself' },
        { value: 'disorganized', label: 'Feel confused and unsure how to respond' }
      ]
    },
    {
      id: 'intimacy',
      question: 'When relationships become very close and intimate, you:',
      options: [
        { value: 'secure', label: 'Feel comfortable and enjoy the closeness' },
        { value: 'anxious', label: 'Want even more closeness and reassurance' },
        { value: 'avoidant', label: 'Sometimes feel overwhelmed and need to pull back' },
        { value: 'disorganized', label: 'Have mixed feelings that change frequently' }
      ]
    },
    {
      id: 'trust',
      question: 'In your relationships, trusting others:',
      options: [
        { value: 'secure', label: 'Comes naturally unless given reason not to' },
        { value: 'anxious', label: 'Happens quickly but I often worry about betrayal' },
        { value: 'avoidant', label: 'Takes time and I prefer to stay independent' },
        { value: 'disorganized', label: 'Varies greatly depending on my mood and the situation' }
      ]
    }
  ];

  const handleResponse = (scenarioId: string, value: string) => {
    const newResponses = [...profile.attachment_responses];
    const existingIndex = newResponses.findIndex(r => r.id === scenarioId);
    
    if (existingIndex >= 0) {
      newResponses[existingIndex] = { id: scenarioId, value };
    } else {
      newResponses.push({ id: scenarioId, value });
    }
    
    setProfile({...profile, attachment_responses: newResponses});
  };

  const getSelectedValue = (scenarioId: string) => {
    const response = profile.attachment_responses.find(r => r.id === scenarioId);
    return response?.value || '';
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-4">
        Please reflect on these scenarios. There are no right or wrong answers - 
        we're simply understanding your natural patterns.
      </p>
      {scenarios.map((scenario) => (
        <div key={scenario.id} className="space-y-3">
          <p className="font-medium text-gray-800">{scenario.question}</p>
          <div className="space-y-2">
            {scenario.options.map((option) => (
              <label
                key={option.value}
                className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                  getSelectedValue(scenario.id) === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`scenario_${scenario.id}`}
                  value={option.value}
                  checked={getSelectedValue(scenario.id) === option.value}
                  onChange={() => handleResponse(scenario.id, option.value)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <span className="text-gray-700">{option.label}</span>
                  {getSelectedValue(scenario.id) === option.value && (
                    <span className="ml-auto text-blue-500">✓</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UniversalProfileOnboarding;