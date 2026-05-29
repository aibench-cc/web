import DimensionCardV2, { type ProbeGroup } from "./DimensionCardV2";

export default function DimensionGroupV2({ groups }: { groups: ProbeGroup[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="px-1 text-xs text-lo print:hidden">
        V2 探针视图按 5 个采购维度分组,每条探针展示权重、信号和可展开 raw_trace。
      </p>
      {groups.map((group) => (
        <DimensionCardV2 key={group.key} group={group} />
      ))}
    </div>
  );
}

export type { ProbeGroup, ProbeItem, ProbeSignal } from "./DimensionCardV2";
