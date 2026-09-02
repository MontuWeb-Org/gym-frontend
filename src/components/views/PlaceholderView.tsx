// src/components/views/PlaceholderView.tsx
"use client";

interface PlaceholderViewProps {
  title?: string;
}

export default function PlaceholderView({ title = "Coming Soon" }: PlaceholderViewProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          This section is currently under development and will be available soon.
        </p>
      </div>
    </div>
  );
}