'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating promotional content
 * for Oskar Shop. It allows admins to generate engaging announcement texts
 * and event descriptions based on various promotion details.
 *
 * - generatePromotionalContent - The main function to call the Genkit flow.
 * - GeneratePromotionalContentInput - The input type for the flow.
 * - GeneratePromotionalContentOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePromotionalContentInputSchema = z.object({
  promotionType: z
    .enum(['discount', 'spin-to-win', 'bonus', 'new-product', 'event', 'general'])
    .describe('The type of promotion (e.g., discount, spin-to-win, bonus).'),
  title: z.string().describe('A short, catchy title for the promotion.'),
  productName: z.string().optional().describe('The name of the product(s) involved in the promotion, if applicable.'),
  promotionDetails: z.string().describe('Detailed information about the promotion, e.g., "50% off Free Fire diamonds", "Spin to win 1000 diamonds with any purchase", "Exclusive bonus for new users."'),
  callToAction: z.string().describe('The desired action for the user, e.g., "Shop now!", "Play now!", "Visit our live stream".'),
  targetAudience: z.string().optional().describe('The specific audience this promotion is targeting, e.g., "gamers", "new users", "loyal customers".'),
  startDate: z.string().optional().describe('The start date of the promotion (e.g., "YYYY-MM-DD").'),
  endDate: z.string().optional().describe('The end date of the promotion (e.g., "YYYY-MM-DD").'),
});
export type GeneratePromotionalContentInput = z.infer<typeof GeneratePromotionalContentInputSchema>;

const GeneratePromotionalContentOutputSchema = z.object({
  announcementText: z
    .string()
    .describe('A concise, eye-catching text suitable for a looping announcement ticker on the homepage (max 100 characters).'),
  eventDescription: z
    .string()
    .describe('A more detailed and engaging description for an event page, banner, or social media post (2-3 paragraphs).'),
  suggestedHashtags: z.array(z.string()).optional().describe('A list of 3-5 relevant hashtags to increase visibility.'),
  emojiSuggestions: z.array(z.string()).optional().describe('A list of 3-5 relevant emojis to add visual appeal.'),
});
export type GeneratePromotionalContentOutput = z.infer<typeof GeneratePromotionalContentOutputSchema>;

export async function generatePromotionalContent(input: GeneratePromotionalContentInput): Promise<GeneratePromotionalContentOutput> {
  return generatePromotionalContentFlow(input);
}

const generatePromotionalContentPrompt = ai.definePrompt({
  name: 'generatePromotionalContentPrompt',
  input: { schema: GeneratePromotionalContentInputSchema },
  output: { schema: GeneratePromotionalContentOutputSchema },
  system: `You are a marketing content generator for 'Oskar Shop', a gaming top-up and accounts store. Your task is to create compelling and engaging promotional text for various marketing channels. Focus on clarity, excitement, and driving user action. The tone should be energetic and trustworthy. Ensure the announcement text is concise (max 100 characters) and the event description is detailed (2-3 paragraphs).`,
  prompt: `Generate promotional content for a '{{promotionType}}' promotion.\n\nTitle: "{{title}}"\nPromotion Details: "{{promotionDetails}}"\nCall to Action: "{{callToAction}}"\n{{#if productName}}\nProduct(s) involved: "{{productName}}"\n{{/if}}\n{{#if targetAudience}}\nTarget Audience: "{{targetAudience}}"\n{{/if}}\n{{#if startDate}}\nStart Date: "{{startDate}}"\n{{/if}}\n{{#if endDate}}\nEnd Date: "{{endDate}}"\n{{/if}}\n\nPlease provide:\n1.  A short, catchy announcement text (max 100 characters) for a looping ticker.\n2.  A detailed, engaging event description (2-3 paragraphs) for a promotion page.\n3.  3-5 relevant hashtags.\n4.  3-5 relevant emojis.`,
});

const generatePromotionalContentFlow = ai.defineFlow(
  {
    name: 'generatePromotionalContentFlow',
    inputSchema: GeneratePromotionalContentInputSchema,
    outputSchema: GeneratePromotionalContentOutputSchema,
  },
  async (input) => {
    const { output } = await generatePromotionalContentPrompt(input);
    return output!;
  },
);
