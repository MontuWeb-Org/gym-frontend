// src/components/views/coach/TraineesView.tsx
"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, Search } from "lucide-react";
import { TraineesTable } from "./components/TraineesTable";

export default function TraineesView() {
  // Ready for backend integration or Redux selectors matching TraineeRecord
  const trainees: Array<{ id: string; name: string; email: string; program: string; progress: number; status?: string }> = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search trainees..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Button className="inline-flex items-center gap-2">
          <UserPlus className="size-4" />
          <span>Add Trainee</span>
        </Button>
      </div>

      <TraineesTable data={trainees} />
    </div>
  );
}