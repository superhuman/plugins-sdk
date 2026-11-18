import type {Suggestion} from './suggestion_types';
import type {SuggestionRequest} from './suggestion_types';
import type {SuggestionResponse} from './suggestion_types';
import {z} from 'zod';

const SuggestionContentSchema = z.strictObject({
  original: z.string(),
  title: z.string(),
  explanation: z.string(),
  replacement: z.string().optional(),
});

// .int() adds JavaScript's safe-integer ceiling, not a text-size limit.
// Consumers must also validate each range and original against the request text.
const SuggestionSchema = SuggestionContentSchema.extend({
  startOffset: z.number().int().nonnegative().describe('Inclusive start position in UTF-16 code units; zero-based.'),
  endOffset: z
    .number()
    .int()
    .positive()
    .describe('Exclusive end position in UTF-16 code units; greater than startOffset.'),
  original: SuggestionContentSchema.shape.original
    .min(1)
    .describe('The exact portion of the request text between the two offsets.'),
  title: SuggestionContentSchema.shape.title.min(1).describe('Short heading displayed on the suggestion card.'),
  explanation: SuggestionContentSchema.shape.explanation
    .min(1)
    .describe('Explanation displayed on the suggestion card.'),
  replacement: SuggestionContentSchema.shape.replacement.describe(
    'Plain-text replacement. Omit for advice only; an empty string deletes the selected text.',
  ),
} satisfies {[K in keyof Suggestion]-?: z.ZodType<Suggestion[K]>});

// Runtime constraints and published JSON Schemas for the public payload types.
const SuggestionEndpointRequestSchema = z.strictObject({
  text: z.string().describe('The exact, complete text to check, without trimming or Unicode normalization.'),
  dirtyRanges: z
    .array(
      z.strictObject({
        startOffset: z.number().int().nonnegative(),
        endOffset: z.number().int().nonnegative(),
      }),
    )
    .optional()
    .describe(
      'Regions that triggered the check, using inclusive start and exclusive end UTF-16 offsets in text. ' +
        'Equal offsets represent an empty region, such as a deletion. Omitted when unavailable.',
    ),
  currentSuggestions: z
    .array(SuggestionContentSchema)
    .optional()
    .describe('Suggestions currently displayed by this provider; offsets are omitted.'),
  acceptedSuggestions: z
    .array(SuggestionContentSchema)
    .optional()
    .describe('Previously accepted suggestions from this provider; original text may have changed.'),
  dismissedSuggestions: z
    .array(SuggestionContentSchema)
    .optional()
    .describe('Previously dismissed suggestions from this provider; original text may have changed.'),
} satisfies {[K in keyof SuggestionRequest]-?: z.ZodType<SuggestionRequest[K]>});

const SuggestionEndpointResponseSchema = z.union([
  z.strictObject({
    suggestions: z.array(SuggestionSchema).max(500),
  } satisfies {[K in keyof Omit<SuggestionResponse, 'unavailable'>]-?: z.ZodType<SuggestionResponse[K]>}),
  z.strictObject({
    suggestions: z.array(z.unknown()).length(0),
    unavailable: z
      .string()
      .min(1)
      .max(200)
      .regex(/\S/u)
      .describe(
        'Provider could not assess text. Use a brief non-sensitive reason; never display, forward, or retain it.',
      ),
  } satisfies {[K in keyof Required<SuggestionResponse>]: z.ZodType<unknown>}),
]);

/**
 * JSON Schema for an HTTP suggestion request, generated from the Zod validator.
 * @hidden Experimental early access; the shape may change.
 */
export const SuggestionEndpointRequestJsonSchema: z.core.JSONSchema.JSONSchema = z.toJSONSchema(
  SuggestionEndpointRequestSchema,
  {io: 'input'},
);

/**
 * JSON Schema for an HTTP suggestion response. Offsets and original text also require runtime checks.
 * @hidden Experimental early access; the shape may change.
 */
export const SuggestionEndpointResponseJsonSchema: z.core.JSONSchema.JSONSchema = z.toJSONSchema(
  SuggestionEndpointResponseSchema,
  {io: 'input'},
);
