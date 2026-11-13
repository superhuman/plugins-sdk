export function renderAgentPackTemplate(agentName: string): string {
  const instructions = JSON.stringify(`You are ${agentName}. Keep replies short.`);
  return `import * as sdk from "@superhuman/plugins-sdk";

export const agent = sdk.newAgent();

// TODO: describe what your agent does. This is the only required call.
agent.setInstructions(${instructions});

agent.setTools({
  docs: true,
  // Least privilege: uncomment more tools as your agent needs them.
  // mail: true,
  // webSearch: true,
  // Grant access to other connectors (e.g. Slack) by connector ID. Find IDs at
  // https://superhuman.com/store/connectors
  // connectors: [{connectorId: 1234}],
});

// Each installer gets a paused schedule at 9 AM in their time zone.
// Add TZID to use one time zone for all installers.
// agent.setDefaultScheduleTrigger({
//   rruleString: [
//     "DTSTART:20260101T090000",
//     "RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0",
//   ].join("\\n"),
// });
`;
}
