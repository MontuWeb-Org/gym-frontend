import Link from "next/link";
import { ClipboardList, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ logId: string }>;
}

export default async function WorkoutLogDetailPage({ params }: PageProps) {
  const { logId } = await params;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="rounded-full border border-border bg-muted p-5">
        <ClipboardList className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-foreground">Workout Log Details</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Workout log <strong>#{logId}</strong> details page is coming soon.
        </p>
      </div>
      <Link
        href="/trainer/trainees"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        Back to Trainees
      </Link>
    </div>
  );
}
