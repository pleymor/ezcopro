'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AssembleeGenerale } from '@/types/assemblee-generale';
import { agTypeLabels } from '@/lib/schemas/assemblee-generale';

interface PouvoirFormProps {
  ag: AssembleeGenerale;
  coproName: string;
}

export function PouvoirForm({ ag, coproName }: PouvoirFormProps) {
  const agDate = ag.date instanceof Date ? ag.date : new Date(ag.date.seconds * 1000);

  return (
    <div className="print-document bg-white p-8 max-w-4xl mx-auto text-black">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">POUVOIR</h1>
        <h2 className="text-lg">
          Assemblée Générale {agTypeLabels[ag.type]} du{' '}
          {format(agDate, 'd MMMM yyyy', { locale: fr })}
        </h2>
        <p className="text-sm mt-2">{coproName}</p>
      </div>

      {/* Mandant section */}
      <div className="mb-8 border border-gray-300 rounded p-4">
        <h3 className="font-bold mb-4 border-b border-gray-200 pb-2">MANDANT (Copropriétaire qui donne pouvoir)</h3>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Nom :</label>
              <div className="border-b border-gray-400 h-8" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Prénom :</label>
              <div className="border-b border-gray-400 h-8" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse du lot :</label>
            <div className="border-b border-gray-400 h-8" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">N° de lot(s) :</label>
              <div className="border-b border-gray-400 h-8" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Tantièmes :</label>
              <div className="border-b border-gray-400 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Mandataire section */}
      <div className="mb-8 border border-gray-300 rounded p-4">
        <h3 className="font-bold mb-4 border-b border-gray-200 pb-2">MANDATAIRE (Personne qui reçoit le pouvoir)</h3>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Nom :</label>
              <div className="border-b border-gray-400 h-8" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Prénom :</label>
              <div className="border-b border-gray-400 h-8" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse :</label>
            <div className="border-b border-gray-400 h-8" />
          </div>
        </div>
      </div>

      {/* Delegation text */}
      <div className="mb-8 text-sm">
        <p className="mb-4">
          Je soussigné(e), copropriétaire désigné ci-dessus, donne pouvoir à la personne
          désignée comme mandataire pour me représenter à l&apos;Assemblée Générale
          {' '}{agTypeLabels[ag.type].toLowerCase()} qui se tiendra le{' '}
          {format(agDate, 'd MMMM yyyy', { locale: fr })} à {ag.heure}, {ag.lieu}.
        </p>

        <p className="mb-4">
          Le mandataire votera en mon nom sur toutes les résolutions inscrites à l&apos;ordre
          du jour de cette assemblée.
        </p>

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <p className="font-medium mb-2">Instructions de vote (facultatif) :</p>
          <p className="text-xs text-gray-600 mb-3">
            Vous pouvez donner des instructions précises à votre mandataire pour certaines résolutions.
          </p>
          <div className="border border-gray-300 rounded h-24" />
        </div>
      </div>

      {/* Legal notice */}
      <div className="mb-8 text-xs bg-yellow-50 border border-yellow-200 p-3 rounded">
        <p className="font-medium mb-1">Important :</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>
            Un mandataire ne peut recevoir plus de trois pouvoirs, sauf si le total des voix
            dont il dispose n&apos;excède pas 10% des voix du syndicat des copropriétaires.
          </li>
          <li>Le syndic ne peut être désigné comme mandataire.</li>
          <li>Ce pouvoir peut être révoqué à tout moment avant le vote.</li>
        </ul>
      </div>

      {/* Signature area */}
      <div className="mt-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <p className="text-sm mb-2">Fait à :</p>
            <div className="border-b border-gray-400 h-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm mb-2">Le :</p>
            <div className="border-b border-gray-400 h-8" />
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm font-medium mb-2">Signature du mandant :</p>
          <p className="text-xs text-gray-500 mb-2">(Précédée de la mention &quot;Bon pour pouvoir&quot;)</p>
          <div className="border border-gray-300 rounded h-24" />
        </div>
      </div>
    </div>
  );
}
