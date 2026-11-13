---
nav: Screen annotations
description: Add comments or rewrites to text while the user writes.
---

# Screen annotations

Agents can draw on-screen annotations that appear as underlines, similar to the ones Grammarly creates. Annotations are available when the agent runs from a [while-writing trigger][while_writing_trigger], and only on editable text.

Two annotation types are supported: rewrites and comments.

=== ":material-comment-edit: Rewrites"

    Rewrite cards allow the agent to suggest alternate text, similar to how Grammarly works. Clicking the card applies the replacement and removes the card.

    {{screenshot("images/agent_annotation_rewrite.png", "A rewrite annotation offering replacement text")}}

=== ":material-comment-text: Comments"

    Comment cards can be used to provide context or more nuanced recommendations.

    {{screenshot("images/agent_annotation_comment.png", "A comment annotation with a fact about a dog breed")}}

To add these annotations, simply mention them in your agent's instructions.

```{.ts hl_lines=8-11}
agent.addDefaultRoutine({
  name: "More dogs",
  trigger: {
    kind: sdk.DefaultTriggerKind.WhileWriting,
    condition: "The writing mentions a dog or a dog breed.",
  },
  instructions: `
    When the writing talks about a dog in a negative way, rewrite
    it to have a more positive spin.
    When the writing mentions a dog breed, add a comment with a
    fun fact about that breed.
  `,
});
```

Each annotation has a title and an explanation, filled in by the model. The title is the top of the card. The explanation is the body of a comment, and on a rewrite it appears when the user hovers the info icon. Refer to "title" and "explanation" in the instructions to steer those fields.

{{screenshot("images/agent_annotation_detail.png", "The explanation on a rewrite card, shown while hovering the info icon")}}


[while_writing_trigger]: ./triggers.md#while-writing
