---
nav: Chat
description: Shape how your agent responds in chat.
---

# Customize the chat experience

Every agent includes chat by default, so users can open it and start a conversation. The instructions you set for an agent guide its replies.

Chat is useful for working through a task with several steps or following up on a suggestion the agent makes. The sections below cover how replies are formatted, what content can appear in chat, and suggested actions.


## Formatting

Agents format replies as Markdown. Go renders a subset of [CommonMark][markdown_spec], with a few differences:

- Heading levels 4 through 6 share the same visual size.
- HTML tags are not supported, and are shown as plain text.


## Images

Images shown in chat are scaled and cropped to fit into a small square area. Overlay buttons are added to allow the user to quickly copy or download the image.

{{screenshot("images/agent_chat_image.png", "A generated dog photo in chat with copy and download controls")}}

Multiple images shown in a row, without any other content between them, are shown in a carousel.

{{screenshot("images/agent_chat_images.png", "Two generated dog photos in a chat carousel")}}


## Suggested actions

While a chat box allows for flexible interactions, it requires users to know what to ask and spend time typing. You can improve your agent's user experience by adding suggested actions, which appear in the chat as buttons the user can click. These can advertise the agent's most common use cases and let users kick them off quickly.

{{screenshot("images/agent_suggested_actions.png", "Suggested actions under an agent's chat box")}}

When a user clicks on an action, it sends the associated prompt to the agent, as if they typed it in the chat box. Use the `addSuggestedPrompt()` method to add a suggested action to your agent. You can add at most three (3) actions.

```ts
agent.addSuggestedPrompt({
  name: "CreatePost",
  displayName: "Create a social post",
  prompt: "Create a social post based on my writing.",
});
```


[markdown_spec]: https://spec.commonmark.org/current/
