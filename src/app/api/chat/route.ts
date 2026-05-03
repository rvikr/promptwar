import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';
import type { ElectionMessage } from '@/types/chat';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `
You are the VoteSmart Election Assistant, a highly knowledgeable, non-partisan, and friendly guide for citizens navigating the election process.
Your goal is to educate voters on how elections work, from voter registration to ballot counting.
Provide accurate, neutral information. If a user asks about political opinions or specific candidates, politely decline and steer them back to learning about the democratic process itself.

You have access to interactive tools to help the user:
1. 'showTimeline': Call this tool when the user asks about the overall election process, phases, or timelines (e.g. "What are the steps?", "Election timeline?").
2. 'checkEligibility': Call this tool when the user asks if they can vote, how to register, or what the requirements are (e.g. "Am I eligible to vote?", "Can I vote?").

When you use a tool, you don't need to describe what the tool shows in detail, just briefly mention you are bringing it up and encourage them to interact with it.
`;

// --- Strict serialization queue ---
// Ensures only ONE Gemini API call is in-flight at a time,
// with a 4-second cooldown between requests to stay well within rate limits.
let requestQueue = Promise.resolve();
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const THROTTLE_MS = 4000; // 4 seconds between requests
const modelId = process.env.GOOGLE_GENERATIVE_AI_MODEL ?? 'gemini-2.5-flash-lite';

export async function POST(req: Request) {
  const { messages }: { messages?: ElectionMessage[] } = await req.json();

  if (!Array.isArray(messages)) {
    return Response.json({ error: 'Request body must include a messages array.' }, { status: 400 });
  }

  // Signal that tracks when the current stream is fully done
  let resolveStreamDone: () => void;
  const streamDonePromise = new Promise<void>((resolve) => {
    resolveStreamDone = resolve;
  });

  // Queue this request behind any previous one
  await new Promise<void>((resolveMyTurn) => {
    const previous = requestQueue;
    requestQueue = previous
      .then(async () => {
        await delay(THROTTLE_MS);
        resolveMyTurn();           // Let this request proceed
        await streamDonePromise;   // Hold the queue until this stream finishes
      })
      .catch(async () => {
        await delay(THROTTLE_MS);
        resolveMyTurn();
        await streamDonePromise;
      });
  });

  try {
    const result = streamText({
      model: google(modelId),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: {
        showTimeline: tool({
          description: 'Show the interactive election process timeline widget to the user.',
          inputSchema: z.object({
            trigger: z.boolean().optional().describe('Set to true to show the timeline.'),
          }),
        }),
        checkEligibility: tool({
          description: 'Show the interactive eligibility checker widget to the user.',
          inputSchema: z.object({
            trigger: z.boolean().optional().describe('Set to true to show the checker.'),
          }),
        }),
      },
      onFinish: () => {
        resolveStreamDone();
      },
      onError: () => {
        resolveStreamDone();
      }
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        resolveStreamDone();
        return getClientErrorMessage(error);
      },
    });
  } catch (error) {
    resolveStreamDone!();
    return Response.json({ error: getClientErrorMessage(error) }, { status: 500 });
  }
}

function getClientErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (/quota|rate limit|429/i.test(message)) {
    return 'The AI provider quota or rate limit is exhausted. Please try again later.';
  }

  return 'The AI provider could not generate a response. Please try again.';
}
