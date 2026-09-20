import { CardSkeleton } from "@/components/metro/page-skeleton";

// Presentation mode while it loads: the hero card, then three chart cards.
const Loading = () => (
  <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-gutter py-12 lg:gap-10 lg:px-12 lg:py-16" aria-busy="true">
    <CardSkeleton rows={2} />
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      <CardSkeleton rows={4} />
      <CardSkeleton rows={4} />
      <CardSkeleton rows={4} />
    </div>
  </div>
);

export default Loading;
