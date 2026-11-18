import * as sdk from "@superhuman/plugins-sdk";

const agent = sdk.newAgent();

// BEGIN

agent.addDefaultRoutine({
  name: "${1:Routine name}",
  trigger: {
    kind: sdk.DefaultTriggerKind.Schedule,
    rruleString: [
      "DTSTART:20260101T000000",
      "RRULE:FREQ=${2:WEEKLY};BYDAY=${3:MO};BYHOUR=${4:9};BYMINUTE=0",
    ].join("\n"),
  },
  instructions: `
    $5$Instructions for the routine.$
  `,
});
