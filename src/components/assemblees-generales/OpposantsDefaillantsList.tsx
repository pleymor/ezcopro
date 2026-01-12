'use client';

interface PersonInfo {
  nom: string;
  prenom: string;
  tantiemes: number;
}

interface OpposantsDefaillantsListProps {
  opposants: PersonInfo[];
  defaillants: PersonInfo[];
}

export function OpposantsDefaillantsList({
  opposants,
  defaillants,
}: OpposantsDefaillantsListProps) {
  const totalOpposants = opposants.reduce((sum, p) => sum + p.tantiemes, 0);
  const totalDefaillants = defaillants.reduce((sum, p) => sum + p.tantiemes, 0);

  return (
    <div className="space-y-6">
      {/* Opposants */}
      <div>
        <h4 className="font-semibold mb-2">
          Opposants ({opposants.length}) - {totalOpposants} tantièmes
        </h4>
        {opposants.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Aucun opposant</p>
        ) : (
          <ul className="text-sm space-y-1">
            {opposants.map((p, index) => (
              <li key={index} className="flex justify-between border-b border-gray-100 py-1">
                <span>{p.nom} {p.prenom}</span>
                <span className="text-gray-600">{p.tantiemes} tantièmes</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Défaillants */}
      <div>
        <h4 className="font-semibold mb-2">
          Défaillants ({defaillants.length}) - {totalDefaillants} tantièmes
        </h4>
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
    </div>
  );
}
