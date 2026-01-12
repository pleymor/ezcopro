'use client';

import { useState } from 'react';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Resolution } from '@/types/assemblee-generale';
import { majoriteTypeLabels } from '@/lib/schemas/assemblee-generale';
import { deleteResolution, reorderResolutions } from '@/lib/firebase/services/resolution';
import { useAuth } from '@/lib/hooks/useAuth';

interface ResolutionListProps {
  resolutions: Resolution[];
  coproId: string;
  agId: string;
  onEdit?: (resolution: Resolution) => void;
  disabled?: boolean;
}

export function ResolutionList({
  resolutions,
  coproId,
  agId,
  onEdit,
  disabled = false,
}: ResolutionListProps) {
  const { user } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<Resolution | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sortedResolutions = [...resolutions].sort((a, b) => a.ordre - b.ordre);

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;

    setIsDeleting(true);
    try {
      await deleteResolution(coproId, agId, deleteTarget.id, user.uid);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting resolution:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || disabled) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...sortedResolutions];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    if (movedItem) {
      newOrder.splice(dragOverIndex, 0, movedItem);
    }

    const orderedIds = newOrder.map((r) => r.id);

    setDraggedIndex(null);
    setDragOverIndex(null);

    if (!user) return;

    try {
      await reorderResolutions(coproId, agId, user.uid, orderedIds);
    } catch (err) {
      console.error('Error reordering resolutions:', err);
    }
  };

  if (resolutions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucune résolution pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {sortedResolutions.map((resolution, index) => (
          <div
            key={resolution.id}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              ${draggedIndex === index ? 'opacity-50' : ''}
              ${dragOverIndex === index ? 'border-t-2 border-primary' : ''}
            `}
          >
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  {!disabled && (
                    <button
                      type="button"
                      className="mt-1 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                      aria-label="Réorganiser"
                    >
                      <GripVertical className="h-5 w-5" />
                    </button>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      <span className="text-muted-foreground mr-2">#{resolution.numero}</span>
                      {resolution.titre}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {majoriteTypeLabels[resolution.typeMajorite]}
                    </p>
                  </div>
                  {!disabled && (
                    <div className="flex gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(resolution)}
                          aria-label="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(resolution)}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              {resolution.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{resolution.description}</p>
                </CardContent>
              )}
            </Card>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Supprimer la résolution"
        description={`Êtes-vous sûr de vouloir supprimer la résolution "${deleteTarget?.titre}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
