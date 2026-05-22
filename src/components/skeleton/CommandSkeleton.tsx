function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4 space-y-2">
      <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse" />
      <div className="h-7 w-12 rounded bg-secondary animate-pulse" />
      <div className="h-3 w-20 rounded bg-secondary animate-pulse" />
    </div>
  );
}

function BarSkeleton() {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
        <div className="h-3 w-6 rounded bg-secondary animate-pulse" />
      </div>
      <div className="h-2 rounded-full bg-secondary animate-pulse" />
    </div>
  );
}

export function CommandSkeleton() {
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
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-secondary animate-pulse" />
            <div className="h-9 w-56 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-72 rounded bg-secondary animate-pulse" />
          </div>
          <div className="h-10 w-24 rounded-xl bg-secondary animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 space-y-3">
            <div className="h-5 w-40 rounded bg-secondary animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60">
                <div className="h-9 w-9 rounded-lg bg-secondary animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
                  <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
                </div>
                <div className="h-5 w-14 rounded bg-secondary animate-pulse" />
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 space-y-3">
            <div className="h-5 w-40 rounded bg-secondary animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <BarSkeleton key={i} />
            ))}
          </div>
          <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 lg:col-span-2">
            <div className="h-5 w-40 rounded bg-secondary animate-pulse mb-3" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-6 w-16 rounded-md bg-secondary animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
