import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface GenerateCoverLetterInput {
  jobDescription: string;
  companyName: string;
  positionTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  experience?: string;
  skills?: string;
  education?: string;
  motivation?: string;
}

export class AIService {
  /**
   * Generate a German cover letter (Anschreiben) using Claude AI
   */
  static async generateCoverLetter(input: GenerateCoverLetterInput): Promise<string> {
    try {
      const prompt = this.buildPrompt(input);

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text from the response
      if (message.content && message.content.length > 0) {
        const content = message.content[0];
        if (content && content.type === 'text') {
          return content.text;
        }
      }

      throw new Error('Unexpected response format from Claude API');
    } catch (error) {
      console.error('Error generating cover letter with Claude:', error);
      throw new Error('Failed to generate cover letter. Please try again.');
    }
  }

  /**
   * Build the prompt for Claude to generate a German cover letter
   */
  private static buildPrompt(input: GenerateCoverLetterInput): string {
    return `You are an expert German job application writer. Generate a professional German cover letter (Anschreiben) for the following job application.

**Job Information:**
- Company: ${input.companyName}
- Position: ${input.positionTitle}
- Job Description: ${input.jobDescription}

**Applicant Information:**
- Name: ${input.applicantName}
- Email: ${input.applicantEmail}
- Phone: ${input.applicantPhone}
${input.experience ? `- Relevant Experience: ${input.experience}` : ''}
${input.skills ? `- Key Skills: ${input.skills}` : ''}
${input.education ? `- Education: ${input.education}` : ''}
${input.motivation ? `- Motivation: ${input.motivation}` : ''}

**Instructions:**
1. Write a professional German cover letter (Anschreiben) following German business letter standards
2. Use the formal "Sie" form throughout
3. Include proper German business letter structure:
   - Sender's address block (right-aligned)
   - Recipient's address block (left-aligned)
   - Date
   - Subject line (Betreff)
   - Salutation (if company name known, use "Sehr geehrte Damen und Herren,")
   - Introduction paragraph
   - Main body (2-3 paragraphs highlighting relevant experience and skills)
   - Closing paragraph
   - Formal closing ("Mit freundlichen Grüßen")
   - Signature placeholder
4. Match the tone to the company and position (professional but not overly stiff)
5. Highlight how the applicant's skills and experience match the job requirements
6. Keep the letter to approximately 300-400 words
7. Make it personalized and compelling, not generic
8. Use proper German grammar, spelling, and business writing conventions

Please generate ONLY the cover letter text, without any additional explanations or comments.`;
  }

  /**
   * Improve/refine an existing cover letter
   */
  static async refineCoverLetter(
    originalLetter: string,
    improvementInstructions: string
  ): Promise<string> {
    try {
      const prompt = `You are an expert German job application writer. Please improve the following German cover letter (Anschreiben) based on these instructions:

**Improvement Instructions:**
${improvementInstructions}

**Original Cover Letter:**
${originalLetter}

**Instructions:**
1. Maintain the formal German business letter structure
2. Keep using the formal "Sie" form
3. Preserve the professional tone
4. Apply the requested improvements
5. Ensure proper German grammar and spelling
6. Return ONLY the improved cover letter text, without explanations

Please generate the improved cover letter:`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      if (message.content && message.content.length > 0) {
        const content = message.content[0];
        if (content && content.type === 'text' && content.text) {
          return content.text;
        }
      }

      throw new Error('Unexpected response format from Claude API');
    } catch (error) {
      console.error('Error refining cover letter with Claude:', error);
      throw new Error('Failed to refine cover letter. Please try again.');
    }
  }

  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key-here';
  }
}
