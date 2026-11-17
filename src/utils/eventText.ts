/**
 * Event lines are plain text. Tribute names inside them are wrapped in a marker
 * character so the renderer can highlight them, instead of the engine emitting
 * an HTML span that the screens then had to feed to dangerouslySetInnerHTML.
 *
 * Names come from user input - the setup fields and Twitch chat display names -
 * so keeping them out of an HTML string is what stops a crafted name being
 * injected as markup. React escapes the text children this produces.
 *
 * U+2063 INVISIBLE SEPARATOR: a formatting character with no width, chosen so a
 * stray marker cannot alter the visible text.
 */
export const NAME_MARKER = '⁣';

export interface EventTextPart {
    text: string;
    isName: boolean;
}

/** Wraps a tribute name so the renderer knows to highlight it. */
export function markPlayerName(name: string): string {
    // Strip any marker already in the name, so the pairs stay balanced
    return NAME_MARKER + name.split(NAME_MARKER).join('') + NAME_MARKER;
}

/**
 * Splits a marked event line into alternating plain and name parts. Markers are
 * added in pairs, so odd-indexed chunks are the names. Even if a line somehow
 * carried an unbalanced marker the worst case is mis-highlighted text - never
 * markup, since every part is rendered as a text child.
 */
export function splitEventText(text: string): EventTextPart[] {
    return text
        .split(NAME_MARKER)
        .map((chunk, index) => ({ text: chunk, isName: index % 2 === 1 }))
        .filter(part => part.text !== '');
}
