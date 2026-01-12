import type { ObligationCategory } from '@/types/obligations';

export const obligationsLegales: ObligationCategory[] = [
  {
    id: 'comptabilite',
    title: 'Obligations comptables',
    iconName: 'calculator',
    description: 'Gestion financière et comptable de la copropriété',
    obligations: [
      {
        id: 'comptabilite-partie-double',
        title: 'Tenue d\'une comptabilité en partie double',
        description: 'Le syndic doit tenir une comptabilité respectant le plan comptable des copropriétés. Chaque opération financière doit être enregistrée selon les principes de la comptabilité en partie double.',
        legalReferences: [
          {
            shortText: 'Art. 14-3 loi 1965',
            fullText: 'Article 14-3 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000006471590',
          },
          {
            shortText: 'Décret 2005-240',
            fullText: 'Décret n° 2005-240 du 14 mars 2005 relatif aux comptes du syndicat des copropriétaires',
            url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006051416',
          },
        ],
        importance: 'critical',
      },
      {
        id: 'comptabilite-comptes-annuels',
        title: 'Présentation des comptes annuels',
        description: 'Le syndic doit présenter les comptes de l\'exercice clos à l\'assemblée générale annuelle. Ces comptes comprennent le budget prévisionnel, le compte de gestion générale et le compte de gestion pour travaux.',
        legalReferences: [
          {
            shortText: 'Art. 18 loi 1965',
            fullText: 'Article 18 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000044074302',
          },
        ],
        importance: 'critical',
      },
      {
        id: 'comptabilite-compte-separe',
        title: 'Ouverture d\'un compte bancaire séparé',
        description: 'Le syndic doit ouvrir un compte bancaire séparé au nom du syndicat des copropriétaires. Ce compte doit être distinct de ses comptes personnels et de ceux des autres copropriétés.',
        legalReferences: [
          {
            shortText: 'Art. 18 loi 1965',
            fullText: 'Article 18 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000044074302',
          },
        ],
        importance: 'critical',
      },
      {
        id: 'comptabilite-cloture',
        title: 'Clôture des comptes à date fixe',
        description: 'L\'exercice comptable doit être clos à une date fixe, généralement le 31 décembre ou à une date définie par le règlement de copropriété. Les comptes doivent être arrêtés et présentés à l\'assemblée générale.',
        legalReferences: [
          {
            shortText: 'Art. 14-1 loi 1965',
            fullText: 'Article 14-1 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043977299',
          },
        ],
        importance: 'important',
      },
    ],
  },
  {
    id: 'assemblees',
    title: 'Assemblées générales',
    iconName: 'users',
    description: 'Organisation et tenue des assemblées générales de copropriétaires',
    obligations: [
      {
        id: 'ag-convocation-delai',
        title: 'Convocation dans les délais légaux',
        description: 'La convocation à l\'assemblée générale doit être notifiée au moins 21 jours avant la date de la réunion. Ce délai peut être réduit à 15 jours en cas d\'urgence.',
        legalReferences: [
          {
            shortText: 'Art. 9 décret 1967',
            fullText: 'Article 9 du décret n° 67-223 du 17 mars 1967',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042078632',
          },
        ],
        importance: 'critical',
      },
      {
        id: 'ag-ordre-jour',
        title: 'Envoi de l\'ordre du jour et des documents',
        description: 'La convocation doit comporter l\'ordre du jour détaillé avec les projets de résolution. Les documents nécessaires à l\'information des copropriétaires doivent être joints ou mis à disposition.',
        legalReferences: [
          {
            shortText: 'Art. 11 décret 1967',
            fullText: 'Article 11 du décret n° 67-223 du 17 mars 1967',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042078649',
          },
        ],
        importance: 'critical',
      },
      {
        id: 'ag-proces-verbal',
        title: 'Rédaction du procès-verbal',
        description: 'Le syndic doit établir le procès-verbal de l\'assemblée générale dans un délai d\'un mois suivant la tenue de l\'assemblée. Ce document doit mentionner toutes les décisions prises et les résultats des votes.',
        legalReferences: [
          {
            shortText: 'Art. 17 décret 1967',
            fullText: 'Article 17 du décret n° 67-223 du 17 mars 1967',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042078689',
          },
        ],
        importance: 'critical',
      },
      {
        id: 'ag-notification',
        title: 'Notification des décisions',
        description: 'Les décisions de l\'assemblée générale doivent être notifiées aux copropriétaires opposants ou défaillants dans un délai d\'un mois. Cette notification fait courir le délai de contestation.',
        legalReferences: [
          {
            shortText: 'Art. 18 décret 1967',
            fullText: 'Article 18 du décret n° 67-223 du 17 mars 1967',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042078697',
          },
          {
            shortText: 'Art. 42 loi 1965',
            fullText: 'Article 42 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039329680',
          },
        ],
        importance: 'important',
      },
    ],
  },
  {
    id: 'assurance',
    title: 'Obligations d\'assurance',
    iconName: 'shield',
    description: 'Couverture des risques de la copropriété',
    obligations: [
      {
        id: 'assurance-rc',
        title: 'Souscription d\'une assurance responsabilité civile',
        description: 'Le syndicat des copropriétaires est tenu de s\'assurer contre les risques de responsabilité civile dont il doit répondre. Cette assurance couvre notamment les dommages résultant d\'un défaut d\'entretien ou d\'un vice de construction des parties communes.',
        legalReferences: [
          {
            shortText: 'Art. 9-1 loi 1965',
            fullText: 'Article 9-1 de la loi n° 65-557 du 10 juillet 1965 (introduit par la loi ALUR du 24 mars 2014)',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000028779136',
          },
        ],
        importance: 'critical',
      },
      {
        id: 'assurance-immeuble',
        title: 'Assurance de l\'immeuble',
        description: 'L\'immeuble doit être assuré contre les risques d\'incendie et les dégâts des eaux au minimum. Le syndic est responsable de la souscription et du renouvellement de cette assurance.',
        legalReferences: [
          {
            shortText: 'Art. 18 loi 1965',
            fullText: 'Article 18 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000044074302',
          },
        ],
        importance: 'critical',
      },
    ],
  },
  {
    id: 'administratif',
    title: 'Obligations administratives',
    iconName: 'file-text',
    description: 'Formalités et registres obligatoires',
    obligations: [
      {
        id: 'admin-immatriculation',
        title: 'Immatriculation au registre national des copropriétés',
        description: 'Toute copropriété doit être immatriculée au registre national des copropriétés tenu par l\'ANAH. Le syndic doit déclarer les informations relatives à la copropriété et les mettre à jour annuellement.',
        legalReferences: [
          {
            shortText: 'Art. L711-1 CCH',
            fullText: 'Article L711-1 du Code de la construction et de l\'habitation',
            url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033974279',
          },
          {
            shortText: 'Loi ALUR 2014',
            fullText: 'Loi n° 2014-366 du 24 mars 2014 pour l\'accès au logement et un urbanisme rénové',
            url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000028772256',
          },
        ],
        importance: 'critical',
      },
      {
        id: 'admin-fiche-synthetique',
        title: 'Mise à jour de la fiche synthétique',
        description: 'Le syndic doit établir et mettre à jour une fiche synthétique de la copropriété regroupant les données financières et techniques essentielles. Cette fiche doit être remise à tout acquéreur potentiel.',
        legalReferences: [
          {
            shortText: 'Art. 8-2 loi 1965',
            fullText: 'Article 8-2 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039313533',
          },
        ],
        importance: 'important',
      },
      {
        id: 'admin-carnet-entretien',
        title: 'Conservation du carnet d\'entretien',
        description: 'Le syndic doit établir et tenir à jour le carnet d\'entretien de l\'immeuble. Ce document recense les informations techniques relatives à la maintenance et aux travaux effectués sur les parties communes.',
        legalReferences: [
          {
            shortText: 'Art. 18 loi 1965',
            fullText: 'Article 18 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000044074302',
          },
        ],
        importance: 'important',
      },
    ],
  },
  {
    id: 'documents',
    title: 'Conservation des documents',
    iconName: 'archive',
    description: 'Archivage et durée de conservation des pièces',
    obligations: [
      {
        id: 'docs-durees',
        title: 'Durées de conservation légales',
        description: 'Les documents de la copropriété doivent être conservés pendant des durées variables selon leur nature : 10 ans pour les documents comptables, 30 ans pour les procès-verbaux d\'assemblée générale, sans limite pour le règlement de copropriété et l\'état descriptif de division.',
        legalReferences: [
          {
            shortText: 'Art. 33 décret 1967',
            fullText: 'Article 33 du décret n° 67-223 du 17 mars 1967',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042078759',
          },
        ],
        importance: 'important',
      },
      {
        id: 'docs-types',
        title: 'Types de documents à conserver',
        description: 'Le syndic doit conserver l\'ensemble des documents relatifs à la copropriété : contrats, factures, correspondances importantes, diagnostics techniques, plans, et tout document pouvant être utile à la gestion de l\'immeuble.',
        legalReferences: [
          {
            shortText: 'Art. 33 décret 1967',
            fullText: 'Article 33 du décret n° 67-223 du 17 mars 1967',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000042078759',
          },
          {
            shortText: 'Art. 18-2 loi 1965',
            fullText: 'Article 18-2 de la loi n° 65-557 du 10 juillet 1965',
            url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039313561',
          },
        ],
        importance: 'standard',
      },
    ],
  },
];
