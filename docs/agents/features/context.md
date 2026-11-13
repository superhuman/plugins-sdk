---
nav: Context
description: Information your agent gets automatically to help it run.
---

# Context

Your agent is provided with relevant context as it runs, such as the content on the screen or basic info about the user. You don't need to configure anything, and all agents get this information automatically.


## Screen context

The agent can see the text and URL of the page the user currently has open. The chat box shows that this context is attached, and the user can remove it for a session.

{{screenshot("images/agent_screen_context.png", "A chat box with the current page attached as context", shadow=False)}}

Three kinds of text may arrive, and more than one can arrive at once.

**Screen information.** The text visible on the screen. Go chooses which parts of the page to include, usually the main content, and leaves out navigation and similar chrome.

!!! info "Full text is not guaranteed"
    The agent receives the text visible on the screen, and often more of the page. Don't assume it has the entire document. The amount of text can be capped, and many apps render more content only as the user scrolls.

**Editor text.** When the user is typing in an editable field, the current value of that field. It is split into numbered paragraphs that the rewrite tool can refer to.

**Selected text.** When the user has selected text, the value of that selection.

Refer to these names in the instructions.

```ts
agent.setInstructions(`
  Write a haiku based on the screen information.
  If text is selected, include those words.
`);
```

Only plain text is passed. Formatting, rich media, and layout information is not made available to the agent.


## User information

The agent receives the user's full name and email address. Use them to personalize a reply or to narrow a search.

!!! warning "Not proof of identity"
    Don't treat that email address as proof of who the user is. Instead connectors should require the user to sign in and verify their identity and access.


## Chat history

The agent can see earlier messages in the current chat, both the user's and its own. Messages from other chats are not included.


## Date and time

Each run includes the current date and time, down to the minute, and the user's time zone.


## Uploaded files

The user can upload files in the chat, and the agent can read them. That covers summarizing a document, extracting data, or answering questions about a file.

Supported formats:

- **Images**, such as PNG, JPG, GIF, and WebP
- **Text**, such as TXT, Markdown, CSV, and code files
- **Office documents**, such as DOCX, XLSX, PPTX, and PDF

The file content arrives with the rest of the context. Nothing in the Pack turns this on.

!!! warning "Files stay in the conversation"
    The agent can read an uploaded file. It can't hand that file to a connector, for example to upload it to a storage service or attach it to a ticket.
