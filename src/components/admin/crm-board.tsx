"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { DealDetailDialog } from "@/components/admin/deal-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { moveDeal } from "@/features/crm/actions";
import type { listBoard } from "@/features/crm/queries";
import { formatBRL } from "@/lib/format";

type BoardStage = Awaited<ReturnType<typeof listBoard>>[number];
type BoardDeal = BoardStage["deals"][number];

function buildColumns(stages: BoardStage[]): Record<string, BoardDeal[]> {
  return Object.fromEntries(stages.map((s) => [s.id, s.deals]));
}

export function CrmBoard({ stages }: { stages: BoardStage[] }) {
  const router = useRouter();
  const [columns, setColumns] = useState<Record<string, BoardDeal[]>>(() => buildColumns(stages));
  const [activeDeal, setActiveDeal] = useState<BoardDeal | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const originStageRef = useRef<string | null>(null);

  // Ressincroniza com a verdade do servidor depois de um router.refresh()
  // (fechamento/perda de negócio) — sem isso, o estado local otimista fica
  // preso na primeira renderização e nunca reflete o que o servidor mudou.
  useEffect(() => {
    setColumns(buildColumns(stages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function findContainer(dealId: string): string | undefined {
    return Object.entries(columns).find(([, deals]) => deals.some((d) => d.id === dealId))?.[0];
  }

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    const container = findContainer(id);
    originStageRef.current = container ?? null;
    setActiveDeal(container ? columns[container]!.find((d) => d.id === id) ?? null : null);
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const fromStage = findContainer(activeId);
    const toStage = stages.some((s) => s.id === overId) ? overId : findContainer(overId);
    if (!fromStage || !toStage || fromStage === toStage) return;

    setColumns((prev) => {
      const fromDeals = prev[fromStage]!;
      const deal = fromDeals.find((d) => d.id === activeId);
      if (!deal) return prev;
      const toDeals = prev[toStage]!;
      const overIndex = toDeals.findIndex((d) => d.id === overId);
      const insertAt = overIndex >= 0 ? overIndex : toDeals.length;
      const nextTo = [...toDeals];
      nextTo.splice(insertAt, 0, deal);
      return {
        ...prev,
        [fromStage]: fromDeals.filter((d) => d.id !== activeId),
        [toStage]: nextTo,
      };
    });
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveDeal(null);
    const activeId = String(active.id);
    const originStageId = originStageRef.current;
    originStageRef.current = null;
    if (!over || !originStageId) return;

    const overId = String(over.id);
    const currentStageId = findContainer(activeId);
    if (!currentStageId) return;

    let finalColumns = columns;
    const deals = columns[currentStageId]!;
    const oldIndex = deals.findIndex((d) => d.id === activeId);
    const overIndexRaw = deals.findIndex((d) => d.id === overId);
    const newIndex = overIndexRaw >= 0 ? overIndexRaw : deals.length - 1;
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      const list = [...deals];
      const [moved] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, moved!);
      finalColumns = { ...columns, [currentStageId]: list };
      setColumns(finalColumns);
    }

    const targetStage = stages.find((s) => s.id === currentStageId)!;
    if (targetStage.isWon || targetStage.isLost) {
      setColumns(buildColumns(stages));
      setSelectedDealId(activeId);
      return;
    }

    const toOrderedIds = finalColumns[currentStageId]!.map((d) => d.id);
    const fromOrderedIds =
      originStageId !== currentStageId
        ? finalColumns[originStageId]?.map((d) => d.id) ?? []
        : [];

    const result = await moveDeal({
      dealId: activeId,
      fromStageId: originStageId,
      toStageId: currentStageId,
      fromOrderedIds,
      toOrderedIds,
    });
    if (!result.ok) {
      setError(result.error ?? "Não foi possível mover o card.");
      setColumns(buildColumns(stages));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">{error}</p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              deals={columns[stage.id] ?? []}
              onSelect={setSelectedDealId}
            />
          ))}
        </div>
        <DragOverlay>{activeDeal && <DealCard deal={activeDeal} />}</DragOverlay>
      </DndContext>

      <DealDetailDialog
        dealId={selectedDealId}
        onClose={() => setSelectedDealId(null)}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}

function Column({
  stage,
  deals,
  onSelect,
}: {
  stage: BoardStage;
  deals: BoardDeal[];
  onSelect: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-card border border-line bg-surface-2/50 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          {stage.name}
        </span>
        <span className="text-xs text-muted">{deals.length}</span>
      </div>
      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          data-testid={`stage-column-${stage.id}`}
          className="flex min-h-16 flex-col gap-2"
        >
          {deals.map((deal) => (
            <SortableDealCard key={deal.id} deal={deal} onSelect={onSelect} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableDealCard({
  deal,
  onSelect,
}: {
  deal: BoardDeal;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(deal.id)}
    >
      <DealCard deal={deal} />
    </div>
  );
}

function DealCard({ deal }: { deal: BoardDeal }) {
  return (
    <div className="cursor-pointer rounded-md border border-line bg-surface p-3 text-sm shadow-sm transition-colors hover:border-accent/50">
      <p className="font-medium">{deal.title || deal.client.name}</p>
      {deal.title && <p className="text-xs text-muted">{deal.client.name}</p>}
      {deal.estimatedValue != null && (
        <p className="mt-1 text-xs font-medium text-accent-ink">
          {formatBRL(deal.estimatedValue)}
        </p>
      )}
      {deal.properties.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          {deal.properties.map((p) => p.property.title).join(", ")}
        </p>
      )}
      {deal.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {deal.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
