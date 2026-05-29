import DimensionCardV2, { type ProbeGroup } from "./DimensionCardV2";

export default function DimensionGroupV2({ groups }: { groups: ProbeGroup[] }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <DimensionCardV2 key={group.key} group={group} />
      ))}
    </div>
  );
}

export type { ProbeGroup, ProbeItem, ProbeSignal } from "./DimensionCardV2";
