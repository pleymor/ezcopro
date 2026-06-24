'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  Globe,
  Lock,
  Check,
  X,
  Info,
  FolderOpen,
  FileText,
  UserPlus,
  Settings,
} from 'lucide-react';

/**
 * Page d'aide sur les rôles et permissions
 * Explique aux utilisateurs comment fonctionne le système d'accès
 */
export default function RolesEtAccesPage() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Rôles et permissions</h1>
        <p className="text-muted-foreground mt-1">
          Comprendre qui peut accéder à quoi dans votre copropriété
        </p>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Comment ça marche ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            EzCopro utilise un système de <strong>3 niveaux d&apos;accès</strong> pour contrôler
            qui peut voir les documents et dossiers de votre copropriété.
          </p>
          <p>
            Chaque document ou dossier a un niveau d&apos;accès qui détermine sa visibilité
            sur l&apos;extranet copropriétaires.
          </p>
        </CardContent>
      </Card>

      {/* Les 3 rôles */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-base">Syndic</CardTitle>
                <CardDescription>Gestionnaire</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Accès complet à tous les documents et paramètres de la copropriété.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Peut tout voir</Badge>
              <Badge variant="outline" className="text-xs ml-1">Peut tout modifier</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base">Conseil syndical</CardTitle>
                <CardDescription>Membres élus</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Copropriétaires désignés pour assister le syndic. Accès élargi aux documents.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Documents &quot;Conseil&quot;</Badge>
              <Badge variant="outline" className="text-xs ml-1">Documents &quot;Tous&quot;</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base">Copropriétaire</CardTitle>
                <CardDescription>Propriétaire de lot</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Accès aux documents publics partagés sur l&apos;extranet copropriétaires.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">Documents &quot;Tous&quot; uniquement</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Niveaux d'accès des documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Niveaux d&apos;accès des documents
          </CardTitle>
          <CardDescription>
            Chaque dossier ou document peut avoir l&apos;un de ces 3 niveaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium">Syndic seul</p>
                <p className="text-sm text-muted-foreground">
                  Documents confidentiels visibles uniquement par le syndic.
                  Exemples : correspondances juridiques, dossiers contentieux.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium">Conseil syndical</p>
                <p className="text-sm text-muted-foreground">
                  Documents accessibles au conseil et au syndic.
                  Exemples : rapports financiers détaillés, devis en cours d&apos;étude.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium">Tous les copropriétaires</p>
                <p className="text-sm text-muted-foreground">
                  Documents publics visibles par tous sur l&apos;extranet.
                  Exemples : PV d&apos;AG, règlement de copropriété, appels de fonds.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matrice des permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Qui peut faire quoi ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">Action</th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex flex-col items-center gap-1">
                      <Lock className="h-4 w-4 text-red-500" />
                      <span>Syndic</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex flex-col items-center gap-1">
                      <Users className="h-4 w-4 text-amber-500" />
                      <span>Conseil</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex flex-col items-center gap-1">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span>Copro.</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    Créer des dossiers
                  </td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Ajouter des documents
                  </td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Télécharger documents &quot;Tous&quot;
                  </td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Télécharger documents &quot;Conseil&quot;
                  </td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Télécharger documents &quot;Syndic&quot;
                  </td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Modifier les niveaux d&apos;accès
                  </td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                    Gérer le conseil syndical
                  </td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="h-5 w-5 text-red-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Qui peut accorder des permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Qui peut accorder des accès ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border bg-muted/50">
            <h4 className="font-medium mb-2">Le syndic peut :</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Inviter des copropriétaires à créer leur compte extranet</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Désigner des copropriétaires comme membres du conseil syndical</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Nommer le président du conseil syndical</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Retirer un membre du conseil syndical</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Choisir le niveau d&apos;accès de chaque dossier et document</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Les copropriétaires ne peuvent pas :</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <span>Se désigner eux-mêmes comme membre du conseil</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <span>Modifier les niveaux d&apos;accès des documents</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <span>Inviter d&apos;autres copropriétaires</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Note finale */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Besoin de modifier les membres du conseil syndical ?
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Rendez-vous dans{' '}
                <a href="/coproprietaires" className="underline font-medium">
                  Copropriétaires
                </a>{' '}
                pour ajouter ou retirer des membres du conseil.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
