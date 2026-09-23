import { PlanTimelineView } from "@/features/trainer/views/PlanTimelineView";

interface PageProps {
  params: Promise<{ planAssignmentId: string }>;
}

export default async function PlanTimelinePage({ params }: PageProps) {
  const { planAssignmentId } = await params;

  return <PlanTimelineView planAssignmentId={Number(planAssignmentId)} />;
}
