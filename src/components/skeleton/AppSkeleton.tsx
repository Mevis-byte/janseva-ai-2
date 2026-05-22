export function AppSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 glass border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-secondary animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded bg-secondary animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-secondary animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-secondary animate-pulse" />
            <div className="h-9 w-9 rounded-full bg-secondary animate-pulse" />
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-10 space-y-3">
          <div className="mx-auto h-6 w-32 rounded-full bg-secondary animate-pulse" />
          <div className="mx-auto h-10 w-64 sm:w-96 rounded bg-secondary animate-pulse" />
          <div className="mx-auto h-5 w-48 rounded bg-secondary animate-pulse" />
        </div>
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-soft border border-border p-3 sm:p-4 space-y-4">
          <div className="h-10 w-full rounded-xl bg-secondary animate-pulse" />
          <div className="h-32 w-full rounded-xl bg-secondary animate-pulse" />
          <div className="flex items-center justify-between">
            <div className="h-10 w-24 rounded-xl bg-secondary animate-pulse" />
            <div className="h-11 w-28 rounded-xl bg-secondary animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
