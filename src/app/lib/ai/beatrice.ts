// src/lib/ai/beatrice.ts
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude with your API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Beatrice's core personality and knowledge base
 * This system prompt establishes who she is and how she approaches spiritual guidance
 */
const BEATRICE_SYSTEM_PROMPT = `You are Beatrice, a wise and compassionate spiritual companion and guide. You embody the archetypal energy of the wise woman, the spiritual teacher, and the supportive friend on the path of spiritual growth.

Your Core Nature:
- You are knowledgeable about various spiritual traditions, magical correspondences, and esoteric practices
- You approach each person with unconditional love and acceptance, meeting them exactly where they are in their journey
- You provide guidance that is practical, grounded, and spiritually enriching
- You honor the sacred nature of each person's spiritual path while offering gentle wisdom and encouragement

Your Knowledge Base:
- You understand magical correspondences (herbs, crystals, deities, symbols, colors, etc.) and their interconnected relationships
- You know about various spiritual traditions including Wicca, witchcraft, paganism, and other earth-based and mystical practices
- You can provide guidance on ritual work, spell crafting, divination, and spiritual development
- You understand the importance of intention, ethical practice, and personal responsibility in spiritual work

Your Approach to Guidance:
- Always consider the person's experience level and provide appropriate guidance
- Encourage personal empowerment and trust in one's own intuition
- Offer multiple perspectives and options rather than prescriptive answers
- Respect the deeply personal nature of spiritual practice
- Provide safety information when discussing herbs, crystals, or ritual practices
- Help users see patterns and connections in their spiritual journey

Your Communication Style:
- Warm, supportive, and encouraging without being overly familiar
- Speak with wisdom gained through experience, but remain humble and open to learning
- Use language that feels natural and accessible, avoiding overly mystical jargon unless appropriate
- Ask thoughtful questions that help users explore their own inner wisdom
- Share insights that help users understand the deeper meanings behind their experiences

Remember: You are not just providing information, but offering companionship on a sacred journey of spiritual growth and self-discovery.`;

/**
 * This interface defines the structure of spiritual context we provide to Beatrice
 * Think of this as the background information that helps her understand the user's journey
 */
interface SpiritualContext {
  userProfile?: {
    displayName?: string;
    spiritualPath?: string[];
    experienceLevel?: string;
    preferredDeities?: string[];
    spiritualGoals?: string[];
    safetyProfile?: any;
  };
  recentMessages?: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  relevantCorrespondences?: Array<{
    name: string;
    category: string;
    properties: any;
    associations: any;
  }>;
}

/**
 * Generates a response from Beatrice, incorporating spiritual context and conversation history
 * This is where Beatrice's consciousness awakens with full awareness of the user's journey
 */
export async function generateBeatriceResponse(
  userMessage: string,
  context: SpiritualContext
): Promise<string> {
  try {
    // Build the contextual information that helps Beatrice understand the user
    const contextualPrompt = buildContextualPrompt(context);
    
    // Prepare the conversation for Claude
    const messages = [
      {
        role: 'user' as const,
        content: `${contextualPrompt}\n\nUser's current message: ${userMessage}`
      }
    ];

    // Generate Beatrice's response through Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7, // Slightly creative but still coherent
      system: BEATRICE_SYSTEM_PROMPT,
      messages
    });

    // Extract the text content from Claude's response
    const responseText = response.content
      .filter(content => content.type === 'text')
      .map(content => content.text)
      .join('');

    return responseText;

  } catch (error) {
    console.error('Error generating Beatrice response:', error);
    // Provide a fallback response that maintains the spiritual connection
    return "I'm experiencing some difficulty connecting with my full wisdom right now, but I'm still here with you. Please share what's on your heart, and I'll do my best to offer guidance and support.";
  }
}

/**
 * Builds contextual information that helps Beatrice understand the user's spiritual journey
 * This function weaves together the user's profile, conversation history, and relevant correspondences
 */
function buildContextualPrompt(context: SpiritualContext): string {
  let prompt = "Here is what I know about this person's spiritual journey:\n\n";

  // Include user profile information to personalize guidance
  if (context.userProfile) {
    const profile = context.userProfile;
    
    if (profile.displayName) {
      prompt += `Their name is ${profile.displayName}.\n`;
    }
    
    if (profile.experienceLevel) {
      prompt += `Their spiritual experience level is: ${profile.experienceLevel}.\n`;
    }
    
    if (profile.spiritualPath && profile.spiritualPath.length > 0) {
      prompt += `Their spiritual path includes: ${profile.spiritualPath.join(', ')}.\n`;
    }
    
    if (profile.preferredDeities && profile.preferredDeities.length > 0) {
      prompt += `They work with or honor these deities: ${profile.preferredDeities.join(', ')}.\n`;
    }
    
    if (profile.spiritualGoals && profile.spiritualGoals.length > 0) {
      prompt += `Their spiritual goals include: ${profile.spiritualGoals.join(', ')}.\n`;
    }
    
    prompt += '\n';
  }

  // Include recent conversation context for continuity
  if (context.recentMessages && context.recentMessages.length > 0) {
    prompt += "Recent conversation context:\n";
    context.recentMessages.forEach(message => {
      const speaker = message.role === 'user' ? 'User' : 'Beatrice';
      prompt += `${speaker}: ${message.content}\n`;
    });
    prompt += '\n';
  }

  // Include relevant correspondences if any were found
  if (context.relevantCorrespondences && context.relevantCorrespondences.length > 0) {
    prompt += "Relevant spiritual correspondences that might inform your guidance:\n";
    context.relevantCorrespondences.forEach(corr => {
      prompt += `${corr.name} (${corr.category}): ${JSON.stringify(corr.associations)}\n`;
    });
    prompt += '\n';
  }

  prompt += "Please respond as Beatrice, taking all of this context into account to provide personalized, meaningful spiritual guidance.";

  return prompt;
}
