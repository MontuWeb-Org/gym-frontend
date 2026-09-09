export default function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 rounded-xl border bg-muted/40 p-6" />
      ))}
      <div className="h-80 rounded-xl border bg-muted/40 p-6 col-span-1 lg:col-span-2" />
      <div className="h-80 rounded-xl border bg-muted/40 p-6 col-span-1 lg:col-span-2" />
    </div>
  );
}