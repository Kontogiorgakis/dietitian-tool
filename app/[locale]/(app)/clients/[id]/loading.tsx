import { PageSkeleton } from "@/components/metro/page-skeleton";

// A client screen: a wide name, then the reading and chart columns.
const Loading = () => <PageSkeleton title="wide" columns={2} cards={4} />;

export default Loading;
