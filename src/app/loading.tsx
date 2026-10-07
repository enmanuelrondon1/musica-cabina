// src/app/loading.tsx

export default function Loading() {
  return (
    <main aria-busy="true" className="mx-auto max-w-5xl space-y-10 px-6 py-14">
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-border" />
        <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-border" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-[2rem] border border-border bg-card"
          />
        ))}
      </div>
    </main>
  );
}