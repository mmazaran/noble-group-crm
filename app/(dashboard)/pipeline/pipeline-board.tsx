"use client";

import { updateClientStage } from "./actions";

const STAGES = [
  { key: "new_lead", label: "New Lead", color: "#6B675C" },
  { key: "contacted", label: "Contacted", color: "#D4A72C" },
  { key: "proposal_sent", label: "Proposal Sent", color: "#4C8FD9" },
  { key: "contract_signed", label: "Contract Signed", color: "#9B59B6" },
  { key: "active_client", label: "Active Client", color: "#E8542C" },
  { key: "completed", label: "Completed", color: "#6B9E78" },
];

type Client = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  pipeline_stage: string;
};

export default function PipelineBoard({ clients }: { clients: Client[] }) {
  const byStage = (stage: string) => clients.filter((c) => c.pipeline_stage === stage);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const cards = byStage(stage.key);
        return (
          <div key={stage.key} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-sm font-medium text-studio-text">{stage.label}</span>
              <span className="ml-auto text-xs font-mono text-studio-muted">{cards.length}</span>
            </div>

            <div className="space-y-2 min-h-[120px]">
              {cards.map((client) => (
                <div
                  key={client.id}
                  className="rounded-lg border border-studio-border bg-studio-surface p-3"
                >
                  <div className="font-medium text-sm text-studio-text mb-1">
                    {client.company_name}
                  </div>
                  {client.contact_name && (
                    <div className="text-xs text-studio-muted mb-2">{client.contact_name}</div>
                  )}
                  <select
                    defaultValue={client.pipeline_stage}
                    onChange={async (e) => {
                      await updateClientStage(client.id, e.target.value);
                    }}
                    className="w-full rounded border border-studio-border bg-studio-bg text-xs px-2 py-1 outline-none focus:border-tungsten text-studio-muted"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {cards.length === 0 && (
                <div className="rounded-lg border border-dashed border-studio-border p-4 text-center text-xs text-studio-faint">
                  No clients
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
