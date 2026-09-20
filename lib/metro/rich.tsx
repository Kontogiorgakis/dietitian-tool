/** The `<b>` tag in message strings: the number or phrase the reader should catch first. */
export const RICH = {
  b: (chunks: React.ReactNode) => <strong className="font-semibold text-ink">{chunks}</strong>,
};
