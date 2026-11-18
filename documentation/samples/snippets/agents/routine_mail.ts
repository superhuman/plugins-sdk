import * as sdk from "@superhuman/plugins-sdk";

const agent = sdk.newAgent();

const $2 = undefined;
const $4 = undefined;
const $5 = undefined;

// BEGIN

agent.addDefaultRoutine({
  name: "${1:Log invoices}",
  trigger: {
    kind: sdk.DefaultTriggerKind.Event,
    type: sdk.EventTriggerType.Mail,
    eventType: sdk.MailEventType[$2],
    filters: {
      conditions: [
        {
          field: sdk.MailFilterField[$4],
          operator: sdk.FilterOperator[$5],
          value: "${6:Value}",
        },
        // TODO: Add more conditions here.
      ],
    },
  },
  instructions: `
    $3$Instructions for the routine.$
  `,
});
