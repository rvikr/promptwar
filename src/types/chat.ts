import type { UIMessage, UITools } from "ai";

export type ElectionTools = {
  showTimeline: {
    input: { trigger?: boolean };
    output: undefined;
  };
  checkEligibility: {
    input: { trigger?: boolean };
    output: undefined;
  };
} & UITools;

export type ElectionMessage = UIMessage<unknown, never, ElectionTools>;
