'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AssembleeGenerale, Resolution } from '@/types/assemblee-generale';
import { agTypeLabels, majoriteTypeLabels } from '@/lib/schemas/assemblee-generale';

interface ConvocationDocumentProps {
  ag: AssembleeGenerale;
  resolutions: Resolution[];
  coproName: string;
  coproAddress: string;
}

export function ConvocationDocument({
  ag,
  resolutions,
  coproName,
  coproAddress,
}: ConvocationDocumentProps) {
  const sortedResolutions = [...resolutions].sort((a, b) => a.ordre - b.ordre);
  const agDate = ag.date instanceof Date ? ag.date : new Date(ag.date.seconds * 1000);

  return (
    <div className="print-document bg-white p-8 max-w-4xl mx-auto text-black">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">CONVOCATION</h1>
        <h2 className="text-xl font-semibold">
          Assemblée Générale {agTypeLabels[ag.type]}
        </h2>
      </div>

      {/* Copropriété info */}
      <div className="mb-8">
        <p className="font-semibold">{coproName}</p>
        <p className="text-sm">{coproAddress}</p>
      </div>

      {/* Convocation details */}
      <div className="mb-8 border border-gray-300 rounded p-4">
        <p className="mb-2">
          <span className="font-semibold">Date :</span>{' '}
          {format(agDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Heure :</span> {ag.heure}
        </p>
        <p>
          <span className="font-semibold">Lieu :</span> {ag.lieu}
        </p>
      </div>

      {/* Legal notice */}
      <div className="mb-8 text-sm italic bg-gray-50 p-4 rounded">
        <p>
          Conformément à l&apos;article 9 du décret du 17 mars 1967, la présente convocation
          est adressée aux copropriétaires au moins 21 jours avant la date de l&apos;assemblée.
        </p>
      </div>

      {/* Order of the day */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">
          ORDRE DU JOUR
        </h3>

        {sortedResolutions.length === 0 ? (
          <p className="text-gray-500 italic">Aucune résolution à l&apos;ordre du jour.</p>
        ) : (
          <ol className="list-decimal list-inside space-y-4">
            {sortedResolutions.map((resolution) => (
              <li key={resolution.id} className="pb-3 border-b border-gray-100 last:border-b-0">
                <span className="font-semibold">{resolution.titre}</span>
                <span className="ml-2 text-sm text-gray-600">
                  ({majoriteTypeLabels[resolution.typeMajorite]})
                </span>
                {resolution.description && (
                  <p className="mt-1 ml-6 text-sm text-gray-700">{resolution.description}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Instructions */}
      <div className="mb-8 text-sm">
        <h4 className="font-semibold mb-2">Modalités de participation :</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Vous pouvez assister personnellement à cette assemblée.</li>
          <li>
            Si vous ne pouvez pas être présent, vous pouvez vous faire représenter
            en remplissant le formulaire de pouvoir ci-joint.
          </li>
          <li>
            Le mandataire ne peut recevoir plus de trois pouvoirs, sauf si le total
            des voix dont il dispose ne dépasse pas 10% des voix totales.
          </li>
        </ul>
      </div>

      {/* Signature area */}
      <div className="mt-12 text-sm">
        <p className="mb-8">
          Fait à _________________________, le {format(new Date(), 'd MMMM yyyy', { locale: fr })}
        </p>
        <div className="flex justify-end">
          <div className="text-center">
            <p className="mb-16">Le Syndic</p>
            <p>_______________________</p>
          </div>
        </div>
      </div>

      {/* Page break for proxy form */}
      <div className="print-page-break" />
    </div>
  );
}
