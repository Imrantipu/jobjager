
import { AIService } from '../services/ai.service';
import Anthropic from '@anthropic-ai/sdk';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk');

const mockCreate = jest.fn();
Anthropic.prototype.messages = {
  create: mockCreate,
} as any;

describe('AIService', () => {
  beforeEach(() => {
    mockCreate.mockClear();
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  describe('isConfigured', () => {
    it('should return true if API key is set', () => {
      expect(AIService.isConfigured()).toBe(true);
    });

    it('should return false if API key is not set', () => {
      process.env.ANTHROPIC_API_KEY = '';
      expect(AIService.isConfigured()).toBe(false);
    });

    it('should return false if API key is the default placeholder', () => {
      process.env.ANTHROPIC_API_KEY = 'your-anthropic-api-key-here';
      expect(AIService.isConfigured()).toBe(false);
    });
  });

  describe('generateCoverLetter', () => {
    const input = {
      jobDescription: 'Test Job Description',
      companyName: 'Test Company',
      positionTitle: 'Test Position',
      applicantName: 'Test Applicant',
      applicantEmail: 'test@example.com',
      applicantPhone: '123456789',
    };

    it('should generate a cover letter successfully', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'Generated Cover Letter' }],
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await AIService.generateCoverLetter(input);

      expect(result).toBe('Generated Cover Letter');
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
          messages: [
            {
              role: 'user',
              content: expect.stringContaining('Test Job Description'),
            },
          ],
        })
      );
    });

    it('should throw an error if the API call fails', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      await expect(AIService.generateCoverLetter(input)).rejects.toThrow(
        'Failed to generate cover letter. Please try again.'
      );
    });

    it('should throw an error for unexpected API response format', async () => {
      const mockResponse = { content: [] };
      mockCreate.mockResolvedValue(mockResponse);

      await expect(AIService.generateCoverLetter(input)).rejects.toThrow(
        'Failed to generate cover letter. Please try again.'
      );
    });
  });

  describe('refineCoverLetter', () => {
    const originalLetter = 'Original cover letter';
    const improvementInstructions = 'Make it more professional';

    it('should refine a cover letter successfully', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'Refined Cover Letter' }],
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await AIService.refineCoverLetter(
        originalLetter,
        improvementInstructions
      );

      expect(result).toBe('Refined Cover Letter');
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
          messages: [
            {
              role: 'user',
              content: expect.stringContaining('Original cover letter'),
            },
          ],
        })
      );
    });

    it('should throw an error if the API call fails', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      await expect(
        AIService.refineCoverLetter(originalLetter, improvementInstructions)
      ).rejects.toThrow('Failed to refine cover letter. Please try again.');
    });

    it('should throw an error for unexpected API response format', async () => {
      const mockResponse = { content: [{ type: 'text', text: null }] };
      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        AIService.refineCoverLetter(originalLetter, improvementInstructions)
      ).rejects.toThrow('Failed to refine cover letter. Please try again.');
    });
  });
});
