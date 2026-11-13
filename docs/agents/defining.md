---
nav: Define an agent
description: Learn about the basic structure of an agent.
---

# Define an agent

Use the SDK to define your agent, adding the configuration and metadata that shapes its behavior. The code is only executed once when you upload the agent, and the execution behavior of the agent is driven by the LLM provided by the platform.


## Structure of an agent

The example below shows a sample meeting notes agent. While the user writes, it suggests clearer action-item rewrites. When asked, it can also schedule a follow-up meeting. Click on an annotation beside a line of code to learn what that feature does.

``` { .ts .annotate }
import * as sdk from "@superhuman/plugins-sdk";

export const agent = sdk.newAgent(); // (1)!

agent.setInstructions(`(2)
  Help the user make meeting action items clear and specific. When an action
  item is vague or incomplete, suggest a rewrite annotation (6). Preserve its
  meaning; never invent owners or deadlines. When asked to schedule a follow-up,
  use Google Calendar. Ask about missing details and wait for confirmation
  before creating the event.
`);

agent.setTools({ // (3)!
  connectors: [
    { connectorId: 1003 }, // Google Calendar
  ],
});

agent.addDefaultRoutine({ // (4)!
  name: "Clarify meeting action items",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting, // (7)!
    condition:
      "Meeting notes with a vague or incomplete action item.",
  },
});

agent.addSuggestedPrompt({ // (5)!
  name: "ScheduleFollowUp",
  displayName: "Schedule a follow-up",
  prompt:
    "Schedule a follow-up meeting for an action item in these notes.",
});
```

1. Use `newAgent()` to create an agent definition, then configure it with builder methods.
2. Instructions give the agent durable guidance for how to handle its work, regardless of how it's invoked.
3. Tools let an agent access connected services and take actions. [Learn more about tools][tools]
4. Routines start an agent automatically when their trigger conditions match. [Learn more about routines and triggers][triggers]
5. Suggested prompts give users a quick way to start a common task, and show up as buttons when the user starts a new chat with the agent. [Learn more about chat and suggested actions][chat]
6. Screen annotations let agents comment on or suggest rewrites to text as users write. [Learn more about screen annotations][screen-annotations]
7. A while-writing trigger runs an agent as the user writes. [Learn about while-writing triggers][while-writing]

[tools]: features/tools.md
[triggers]: features/triggers.md
[chat]: features/chat.md
[screen-annotations]: features/screen-annotations.md
[while-writing]: features/triggers.md#while-writing
