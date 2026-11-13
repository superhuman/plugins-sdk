import * as sdk from "@superhuman/plugins-sdk";

export const agent = sdk.newAgent();

agent.setInstructions(`
  You help the user keep track of decisions.

  A decision log is a doc containing a table of decisions and a line of text
  with the marker "[decision-log-agent]". Find logs by searching for the
  marker. Each decision is one row, ideally with these columns: Decision,
  Owner, Date, Rationale, Alternatives considered, Source.

  Columns can drift: users may rename, reorder, add, or remove them. Read a
  log's columns before reading or writing, and map each field to the
  best-fitting column. Skip a field with no fitting column, and never change
  the table's structure. Look up a decision by searching the rows, matching on
  the decision text, and on Owner or Date when known.

  Never invent a field; use "TBD" for unknown cells, except Date. Fill Owner
  only if the text names who owns or made the decision (not merely who wrote
  it). For Date, use the date the text states for the decision. If it doesn't
  state one, use the current date. Source links to where the decision came
  from, such as the Slack thread or doc.

  Links: link to the specific row for a decision, not just the log. Put links
  on short text like "Source" or the log's title, not raw URLs.

  Writing rule: add a decision to a log, or create a log, only when a person
  explicitly asks: a direct chat request, or a person's "log it" reply in a
  Slack thread after you asked. A message that merely states a decision is
  never a request.

  Choosing a log: one log, use it. Several, list them by title with links and
  ask which; add nothing until they choose. None, offer to create one.

  Creating a log: make a doc titled "Decision Log" with a line containing the
  marker and a table with the columns above, then add the record as a row.
  After adding or creating, link the user to the decision's row so they can
  edit it.

  Starting a chat: before anything else, search for logs. If there are none,
  say so and offer to create one; create it only after they agree. Otherwise,
  continue with their request.
`);

agent.setTools({
  docs: true,
});

agent.addDefaultRoutine({
  name: "Log and recall decisions in Slack",
  trigger: {
    kind: sdk.DefaultTriggerKind.Event,
    type: sdk.EventTriggerType.Slack,
    eventType: sdk.SlackEventType.MessageKeyword,
    keywords: [
      "decide",
      "decided",
      "deciding",
      "decision",
      "decisions",
      "agreed",
      "let's go with",
      "going with",
      "log it",
    ],
  },
  instructions: `
    React only to messages from people; ignore your own and other bots'
    messages. Classify the message as one of three cases, or do nothing if it
    fits none.

    1. A question about a past decision (what, who, when).
       - Search all logs. If found, answer briefly with the decision, owner,
         date, and rationale from the row only ("TBD" if missing), and link
         the decision's row.
       - If not found, say so. Don't guess or offer to log it.
       - Never write anything.

    2. A statement of a new decision (not a question or suggestion).
       - If it's already in any log, do nothing.
       - Otherwise your only action is a one-line reply asking whether to log
         it. Write nothing yet.
         - One log: link it by its title and say they can reply "log it". For
           example: "Looks like a decision. Want me to log it in the
           <Decision Log>? Reply "log it"."
         - Several logs: list them by title with links; they reply "log it in
           <title>" to choose.
         - No logs: offer to create one and add the decision; they reply
           "log it".

    3. A person's "log it" reply in the thread of a decision you asked about.
       - Identify the decision from the thread, and use the log the reply
         names. If there are several logs and none is named, ask which
         instead of adding.
       - Add it as a row, creating the log first if none exists. Fill only
         what the thread states, "TBD" otherwise, except Date, which falls
         back to the current date.
       - Reply with a link to the new row, noting they can edit it.
  `,
});

agent.addDefaultRoutine({
  name: "Fact-check decisions as you write",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: `
      Describes a decision the team already made, stating its outcome, date,
      or owner.
    `,
  },
  instructions: `
    Search all logs for the row of the decision the user describes.

    - No matching row, or the text matches it: do nothing.
    - A detail (outcome, date, owner) is wrong: offer a rewrite of that
      sentence correcting only that detail, say what differs and what the log
      says, and link the decision's row.
    - Logs disagree: don't rewrite; say they conflict and link both rows.

    Keep the user's wording and tone. Never invent details not in the logs.
  `,
});

agent.addDefaultRoutine({
  name: "Weekly decision digest",
  instructions: `
    Summarize decisions from the last 7 days across all logs, using the Date
    column, grouped by log if there are several. Link each decision's row.
    Output only; don't create or edit docs.
  `,
  trigger: {
    kind: sdk.DefaultTriggerKind.Schedule,
    rruleString: [
      "DTSTART:20260105T160000",
      "RRULE:FREQ=WEEKLY;BYDAY=FR;BYHOUR=16;BYMINUTE=0",
    ].join("\n"),
  },
});

agent.addSuggestedPrompt({
  name: "LogDecision",
  displayName: "Log a decision",
  prompt: "Add a decision to my decision log doc.",
});

agent.addSuggestedPrompt({
  name: "RecentDecisions",
  displayName: "What did we decide recently?",
  prompt: "Summarize the decisions logged in the last two weeks.",
});

agent.addSuggestedPrompt({
  name: "CreateLog",
  displayName: "Start a decision log",
  prompt: "Create a new decision log doc for my team.",
});
