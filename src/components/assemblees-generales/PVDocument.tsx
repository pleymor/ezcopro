'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AssembleeGenerale, Resolution, Presence } from '@/types/assemblee-generale';
import { agTypeLabels, majoriteTypeLabels, resolutionResultatLabels } from '@/lib/schemas/assemblee-generale';

interface PersonInfo {
  nom: string;
  prenom: string;
  tantiemes: number;
}

interface PVDocumentProps {
  ag: AssembleeGenerale;
  resolutions: Resolution[];
  presences: Presence[];
  coproName: string;
  coproAddress: string;
  opposantsPerResolution: Record<string, PersonInfo[]>;
  defaillants: PersonInfo[];
}

export function PVDocument({
  ag,
  resolutions,
  presences,
  coproName,
  coproAddress,
  opposantsPerResolution,
  defaillants,
}: PVDocumentProps) {
  const sortedResolutions = [...resolutions].sort((a, b) => a.ordre - b.ordre);
  const agDate = ag.date instanceof Date ? ag.date : new Date(ag.date.seconds * 1000);

  // Calculate attendance stats
  const presents = presences.filter((p) => p.statut === 'present');
  const representes = presences.filter((p) => p.statut === 'represente');
  const absents = presences.filter((p) => p.statut === 'absent');

  const tantiemesPresents = presents.reduce((sum, p) => sum + p.tantiemes, 0);
  const tantiemesRepresentes = representes.reduce((sum, p) => sum + p.tantiemes, 0);
  const tantiemesAbsents = absents.reduce((sum, p) => sum + p.tantiemes, 0);
  const totalTantiemes = tantiemesPresents + tantiemesRepresentes + tantiemesAbsents;

  return (
    <div className="print-document bg-white p-8 max-w-4xl mx-auto text-black">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">PROCÈS-VERBAL</h1>
        <h2 className="text-xl font-semibold">
          Assemblée Générale {agTypeLabels[ag.type]}
        </h2>
        <p className="text-sm mt-2">
          {format(agDate, 'd MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {/* Copropriété info */}
      <div className="mb-8">
        <p className="font-semibold">{coproName}</p>
        <p className="text-sm">{coproAddress}</p>
      </div>

      {/* Meeting details */}
      <div className="mb-8 border border-gray-300 rounded p-4">
        <h3 className="font-bold mb-3">Réunion</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Date :</span>{' '}
            {format(agDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </div>
          <div>
            <span className="font-medium">Heure :</span> {ag.heure}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Lieu :</span> {ag.lieu}
          </div>
        </div>
      </div>

      {/* Attendance summary */}
      <div className="mb-8 border border-gray-300 rounded p-4 print-avoid-break">
        <h3 className="font-bold mb-3">Feuille de présence</h3>

        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="font-medium text-green-700">Présents</p>
            <p className="text-lg font-bold">{presents.length}</p>
            <p className="text-xs text-gray-600">{tantiemesPresents} tantièmes</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <p className="font-medium text-blue-700">Représentés</p>
            <p className="text-lg font-bold">{representes.length}</p>
            <p className="text-xs text-gray-600">{tantiemesRepresentes} tantièmes</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="font-medium text-gray-700">Absents</p>
            <p className="text-lg font-bold">{absents.length}</p>
            <p className="text-xs text-gray-600">{tantiemesAbsents} tantièmes</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-medium">
            Total représenté : {tantiemesPresents + tantiemesRepresentes} / {totalTantiemes} tantièmes
            ({((tantiemesPresents + tantiemesRepresentes) / totalTantiemes * 100).toFixed(1)}%)
          </p>
        </div>

        {/* Detailed attendance list */}
        <div className="mt-4 text-xs">
          <p className="font-medium mb-2">Liste des participants :</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Nom</th>
                <th className="text-center py-1">Tantièmes</th>
                <th className="text-center py-1">Statut</th>
              </tr>
            </thead>
            <tbody>
              {[...presences].sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`)).map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-1">{p.nom} {p.prenom}</td>
                  <td className="text-center py-1">{p.tantiemes}</td>
                  <td className="text-center py-1">
                    {p.statut === 'present' && 'Présent'}
                    {p.statut === 'represente' && 'Représenté'}
                    {p.statut === 'absent' && 'Absent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolutions and vote results */}
      <div className="mb-8">
        <h3 className="font-bold mb-4 border-b-2 border-gray-300 pb-2">
          RÉSOLUTIONS
        </h3>

        {sortedResolutions.length === 0 ? (
          <p className="text-gray-500 italic">Aucune résolution.</p>
        ) : (
          <div className="space-y-6">
            {sortedResolutions.map((resolution) => {
              const isVoted = resolution.resultat !== 'non_vote';
              const opposants = opposantsPerResolution[resolution.id] || [];

              return (
                <div key={resolution.id} className="border border-gray-200 rounded p-4 print-avoid-break">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">
                        Résolution n°{resolution.numero} - {resolution.titre}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {majoriteTypeLabels[resolution.typeMajorite]}
                      </p>
                    </div>
                    {isVoted && (
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          resolution.resultat === 'adopte'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {resolutionResultatLabels[resolution.resultat]}
                      </span>
                    )}
                  </div>

                  {resolution.description && (
                    <p className="text-sm text-gray-700 mb-3">{resolution.description}</p>
                  )}

                  {isVoted && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div className="text-center">
                          <p className="text-green-600 font-medium">Pour</p>
                          <p className="font-bold">{resolution.votePour} tantièmes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-red-600 font-medium">Contre</p>
                          <p className="font-bold">{resolution.voteContre} tantièmes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 font-medium">Abstention</p>
                          <p className="font-bold">{resolution.voteAbstention} tantièmes</p>
                        </div>
                      </div>

                      {/* Opposants for this resolution */}
                      {opposants.length > 0 && (
                        <div className="text-xs mt-2 pt-2 border-t border-gray-100">
                          <p className="font-medium text-gray-700">Opposants :</p>
                          <p className="text-gray-600">
                            {opposants.map((o) => `${o.nom} ${o.prenom}`).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isVoted && (
                    <p className="text-sm text-gray-500 italic mt-2">Non voté</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Défaillants */}
      <div className="mb-8 border border-gray-300 rounded p-4 print-avoid-break">
        <h3 className="font-bold mb-3">Défaillants</h3>
        <p className="text-sm text-gray-600 mb-3">
          Copropriétaires absents et non représentés lors de l&apos;assemblée.
        </p>
        {defaillants.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Aucun défaillant</p>
        ) : (
          <ul className="text-sm space-y-1">
            {defaillants.map((p, index) => (
              <li key={index} className="flex justify-between border-b border-gray-100 py-1">
                <span>{p.nom} {p.prenom}</span>
                <span className="text-gray-600">{p.tantiemes} tantièmes</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Signatures */}
      <div className="mt-12 print-avoid-break">
        <p className="text-sm mb-8">
          Le présent procès-verbal a été dressé et signé séance tenante.
        </p>

        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-sm font-medium mb-16">Le Président de séance</p>
            <div className="border-t border-gray-400 mx-8" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium mb-16">Le Secrétaire</p>
            <div className="border-t border-gray-400 mx-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
