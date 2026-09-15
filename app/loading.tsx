import type { FC } from "react";

const Loading: FC = () => (
  <main
    className="page-shell py-8"
    aria-busy="true"
    aria-label="Loading the visual journal"
  >
    <div className="wordmark mb-16">
      still<span className="logo-dot">.</span>
    </div>
    <div className="mb-6 h-4 w-52 animate-pulse rounded bg-surface-strong" />
    <div className="mb-3 h-20 max-w-2xl animate-pulse rounded-xl bg-surface-strong" />
    <div className="mb-16 h-20 max-w-xl animate-pulse rounded-xl bg-surface-strong" />
    <div className="mb-8 flex gap-3">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-9 w-20 animate-pulse rounded-full bg-surface-strong"
        />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className={`animate-pulse rounded-xl bg-surface-strong ${item % 2 === 0 ? "aspect-[3/4]" : "aspect-square"}`}
        />
      ))}
    </div>
  </main>
);

export default Loading;
