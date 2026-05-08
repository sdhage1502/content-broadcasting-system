"use client";
import { useEffect, useState } from "react";
import { Radio, Tv } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { liveService } from "@/services/live.service";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import type { Content } from "@/types";

interface State {
  ready: boolean;
  teacherName: string | null;
  items: Content[];
  error: string | null;
}

export function LiveContent({ teacherId }: { teacherId: string }) {
  const [state, setState] = useState<State>({
    ready: false,
    teacherName: null,
    items: [],
    error: null,
  });
  const [activeIdx, setActiveIdx] = useState(0);

  // Realtime Firestore subscription
  useEffect(() => {
    const unsub = liveService.subscribe(
      teacherId,
      ({ teacherName, items }) => {
        setState({ ready: true, teacherName, items, error: null });
      },
      (err) => {
        setState((s) => ({ ...s, ready: true, error: err.message }));
      },
    );
    return unsub;
  }, [teacherId]);

  const items = state.items;
  const current = items.length ? items[activeIdx % items.length] : undefined;

  // Reset index if items shrink
  useEffect(() => {
    if (activeIdx >= items.length && items.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIdx(0);
    }
  }, [items.length, activeIdx]);

  // Rotation timer per current item
  useEffect(() => {
    if (items.length <= 1 || !current) return;
    const minutes = Math.max(1, current.rotationDuration);
    const id = setTimeout(() => setActiveIdx((i) => (i + 1) % items.length), minutes * 60_000);
    return () => clearTimeout(id);
  }, [activeIdx, items.length, current]);

  if (!state.ready) return <LoadingState label="Connecting…" />;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3 text-sm">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-red-400 animate-pulse" />
          <span className="font-medium">LIVE</span>
          <span className="text-white/60">·</span>
          <span className="text-white/80">{state.teacherName ?? `Teacher ${teacherId}`}</span>
        </div>
        <div className="text-xs text-white/50">Realtime via Firestore</div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        {state.error && !current && <p className="text-sm text-red-300">{state.error}</p>}
        {!current && !state.error && (
          <EmptyState
            icon={Tv}
            title="No active broadcast"
            description="Nothing is scheduled to display right now. This page updates automatically."
            className="border-white/10 bg-white/5 text-white"
          />
        )}
        {current && (
          <figure className="flex w-full max-w-5xl flex-col items-center gap-4">
            {current.filePublicId ? (
              <CldImage
                key={current.id}
                src={current.filePublicId}
                alt={current.title}
                width={1600}
                height={1200}
                version={current.fileVersion}
                className="max-h-[70vh] w-auto rounded-md object-contain shadow-2xl"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={current.id}
                src={current.fileUrl}
                alt={current.title}
                className="max-h-[70vh] w-auto rounded-md object-contain shadow-2xl"
              />
            )}
            <figcaption className="text-center">
              <h1 className="text-2xl font-semibold">{current.title}</h1>
              <p className="mt-1 text-sm text-white/70">
                {current.subject}
                {items.length > 1 && (
                  <>
                    {" · "}
                    {activeIdx + 1} of {items.length}
                  </>
                )}
              </p>
            </figcaption>
          </figure>
        )}
      </main>
    </div>
  );
}
