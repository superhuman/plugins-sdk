// --8<-- [start:boilerplate]
import * as sdk from "@superhuman/plugins-sdk";
export const agent = sdk.newAgent();
// --8<-- [end:boilerplate]

// --8<-- [start:instructions]
agent.setInstructions(`
  Find each unique package tracking number on screen.

  1. Look up its status with the right connector.
  2. Show a card next to it with:
     - Carrier
     - Current status
     - Estimated delivery date, if available
     - Latest location and update time, if available

  If a number is invalid or the lookup fails, show
  a card saying why. One card per number.
`);
// --8<-- [end:instructions]

// --8<-- [start:tools]
agent.setTools({
  connectors: [
    // FedEx
    { connectorId: 1070 },
    // UPS
    { connectorId: 1071 },
  ],
});
// --8<-- [end:tools]

// --8<-- [start:routine]
agent.addDefaultRoutine({
  name: "Find tracking numbers",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: "Includes a package tracking number.",
    blockedDomains: ["fedex.com", "ups.com"],
  },
});
// --8<-- [end:routine]
