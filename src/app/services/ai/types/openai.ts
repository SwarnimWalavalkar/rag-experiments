type SystemMessage = {
  role: "system";
  content: string;
  name?: string;
};

type UserMessage = {
  role: "user";
  content: string;
  name?: string;
};

type AssistantMessage = {
  role: "assistant";
  content: string;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
};

type ToolMessage = {
  role: "tool";
  content: string;
  tool_call_id: string;
};

type ChatMessage = SystemMessage | UserMessage | AssistantMessage | ToolMessage;

type ChatCompletionRequest = {};
