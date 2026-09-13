import { TraineeDetailsView } from "@/features/trainer/views/TraineeDetailsView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TraineeDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <TraineeDetailsView traineeId={Number(id)} />;
}