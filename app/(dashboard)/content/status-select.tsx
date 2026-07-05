"use client";

import { updateContentStatus } from "./actions";

const STATUSES = ["planned", "shot", "editing", "ready", "scheduled", "posted"];

export default function StatusSelect({ id, currentStatus }: { id: string; currentStatus: string }) {
  return (
    <select
      defaultValue={currentStatus}
      onChange={(e) => updateContentStatus(id, e.target.value)}
      className="w-full text-xs rounded border border-studio-border bg-studio-bg px-2 py-1 outline-none focus:border-tungsten"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
