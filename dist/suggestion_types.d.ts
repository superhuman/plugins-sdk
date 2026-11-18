/** @hidden In early access, live in production but the shape may change. */
type SuggestionContent = Pick<Suggestion, 'original' | 'title' | 'explanation' | 'replacement'>;
/** @hidden In early access, live in production but the shape may change. */
export interface SuggestionRequest {
    /**
     * The exact, complete text to check, without trimming or Unicode normalization.
     */
    text: string;
    /**
     * Regions that triggered this check, relative to text after editor markers are removed.
     * Offsets count UTF-16 code units; start is inclusive and end is exclusive.
     * Equal offsets represent an empty region, such as a deletion. Omitted when unavailable.
     */
    dirtyRanges?: Array<{
        startOffset: number;
        endOffset: number;
    }>;
    /** Suggestions currently displayed by this provider. Omitted when unavailable. */
    currentSuggestions?: SuggestionContent[];
    /** Previously accepted suggestions from this provider. Their original text may have changed. */
    acceptedSuggestions?: SuggestionContent[];
    /** Previously dismissed suggestions from this provider. Their original text may have changed. */
    dismissedSuggestions?: SuggestionContent[];
}
/** @hidden In early access, live in production but the shape may change. */
interface SuggestionEndpointSuccessResponse {
    /** At most 500 suggestions from a completed check. */
    suggestions: Suggestion[];
}
/** @hidden In early access, live in production but the shape may change. */
export interface Suggestion {
    /**
     * Inclusive start position in UTF-16 code units; zero-based.
     */
    startOffset: number;
    /**
     * Exclusive end position in UTF-16 code units; greater than startOffset.
     */
    endOffset: number;
    /**
     * The exact portion of the request text between the two offsets.
     */
    original: string;
    /**
     * Short heading displayed on the suggestion card.
     */
    title: string;
    /**
     * Explanation displayed on the suggestion card.
     */
    explanation: string;
    /**
     * Plain-text replacement. Omit for advice only; an empty string deletes the selected text.
     */
    replacement?: string;
}
/** @hidden In early access, live in production but the shape may change. */
interface SuggestionEndpointUnavailableResponse {
    /** An unavailable check returns no suggestions. */
    suggestions: [];
    /**
     * Provider could not assess text. Existing suggestions are preserved without an LLM fallback.
     * Use a brief, non-sensitive reason without request text; never display, forward, or retain it.
     * Use non-2xx HTTP responses for service failures.
     */
    unavailable: string;
}
/** @hidden In early access, live in production but the shape may change. */
export type SuggestionResponse = (SuggestionEndpointSuccessResponse & {
    unavailable?: never;
}) | SuggestionEndpointUnavailableResponse;
export {};
