const WORDS_PER_MINUTE = 220;
const CODE_BLOCK_SECONDS = 20;

export function estimateReadingMinutes(markdown: string) {
  const codeBlocks = markdown.match(/```[\s\S]*?```|~~~[\s\S]*?~~~/g) ?? [];
  const prose = markdown
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ');
  const words = prose.match(/[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu) ?? [];
  const proseMinutes = words.length / WORDS_PER_MINUTE;
  const codeMinutes = (codeBlocks.length * CODE_BLOCK_SECONDS) / 60;

  return Math.max(1, Math.ceil(proseMinutes + codeMinutes));
}
