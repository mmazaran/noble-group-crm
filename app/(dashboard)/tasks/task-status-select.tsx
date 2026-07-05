"use client";

import { updateTaskStatus } from "./actions";

export default function TaskStatusSelect({ id, currentStatus }: { id: string; currentStatus: string }) {
  return (
    <select
      defaultValue={currentStatus}
      onChange={(e) => updateTaskStatus(id, e.target.value)}
      className="text-xs rounded border border-studio-border bg-studio-bg px-2 py-1 outline-none focus:border-tungsten"
    >
      <option value="todo">To do</option>
      <option value="in_progress">In progress</option>
      <option value="done">Done</option>
    </select>
  );
}
