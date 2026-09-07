import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { TraineeRecord } from "@/data/mock/trainees.data";

interface TraineesTableProps {
  data: TraineeRecord[];
}

export function TraineesTable({ data }: TraineesTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 border-b border-border text-muted-foreground">
          <tr>
            <th className="p-4 font-medium">Name</th>
            <th className="p-4 font-medium">Program</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Progress</th>
            <th className="p-4 font-medium text-end">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((trainee) => (
            <tr key={trainee.id} className="hover:bg-muted/30 transition-colors">
              <td className="p-4 font-medium">{trainee.name}</td>
              <td className="p-4 text-muted-foreground">{trainee.program}</td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  trainee.status === "Active" 
                    ? "bg-green-500/10 text-green-500" 
                    : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  {trainee.status}
                </span>
              </td>
              <td className="p-4">{trainee.progress}%</td>
              <td className="p-4 text-end">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}