export function ProfileSkeleton() {
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
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="h-4 w-16 rounded bg-secondary animate-pulse mb-6" />
        <div className="bg-card rounded-3xl shadow-soft border border-border p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-secondary animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-7 w-40 rounded bg-secondary animate-pulse" />
              <div className="h-4 w-56 rounded bg-secondary animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
              <div className="h-11 w-full rounded-xl bg-secondary animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
              <div className="h-11 w-full rounded-xl bg-secondary animate-pulse" />
            </div>
            <div className="h-11 w-32 rounded-xl bg-secondary animate-pulse" />
          </div>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 space-y-2">
              <div className="h-3 w-24 rounded bg-secondary animate-pulse" />
              <div className="h-5 w-32 rounded bg-secondary animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
