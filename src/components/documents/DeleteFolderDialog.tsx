'use client';

import { useState } from 'react';
import { Folder, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  isEmpty: boolean;
  onConfirm: (force: boolean) => Promise<void>;
}

/**
 * Dialog de confirmation de suppression d'un dossier
 */
export function DeleteFolderDialog({
  open,
  onOpenChange,
  folderName,
  isEmpty,
  onConfirm,
}: DeleteFolderDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(forceDelete);
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
      setForceDelete(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-amber-600" />
            Supprimer le dossier ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block mb-4">
              Êtes-vous sûr de vouloir supprimer le dossier{' '}
              <span className="font-semibold text-foreground">&quot;{folderName}&quot;</span> ?
            </span>

            {!isEmpty && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      Ce dossier n&apos;est pas vide
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Il contient des sous-dossiers ou des documents. Si vous le supprimez,
                      les documents seront déplacés vers la racine et les sous-dossiers
                      seront supprimés récursivement.
                    </p>
                    <div className="flex items-center space-x-2 mt-3">
                      <Checkbox
                        id="force-delete"
                        checked={forceDelete}
                        onCheckedChange={(checked) => setForceDelete(checked === true)}
                        data-testid="force-delete-checkbox"
                      />
                      <Label
                        htmlFor="force-delete"
                        className="text-sm text-amber-800 dark:text-amber-200 cursor-pointer"
                      >
                        Je comprends et je souhaite supprimer ce dossier
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || (!isEmpty && !forceDelete)}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            data-testid="confirm-delete-folder"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
