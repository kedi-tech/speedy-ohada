'use client';

import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';

export default function HelpPage() {
  const { lang } = useT();
  const fr = lang === 'fr';

  const topics = [
    {
      icon: <Icons.upload />,
      title_fr: 'Importer une balance',
      title_en: 'Import a balance',
      desc_fr: 'Formats supportés : Excel (.xlsx) et CSV. La balance doit contenir les colonnes numéro de compte, libellé, débit et crédit.',
      desc_en: 'Supported formats: Excel (.xlsx) and CSV. The balance must contain account number, label, debit and credit columns.',
    },
    {
      icon: <Icons.link />,
      title_fr: 'Affecter les comptes',
      title_en: 'Map accounts',
      desc_fr: 'Chaque compte doit être affecté à une catégorie SYSCOHADA (Actif, Passif, CR…). Les affectations manuelles nécessitent une justification.',
      desc_en: 'Each account must be assigned to a SYSCOHADA category (Assets, Liabilities, IS…). Manual mappings require a justification.',
    },
    {
      icon: <Icons.notes />,
      title_fr: 'Compléter les notes annexes',
      title_en: 'Complete annex notes',
      desc_fr: '36 notes SYSCOHADA doivent être complétées. Certaines sont préremplies automatiquement à partir des données importées.',
      desc_en: '36 SYSCOHADA notes must be completed. Some are pre-filled automatically from imported data.',
    },
    {
      icon: <Icons.eye />,
      title_fr: 'Processus de révision',
      title_en: 'Review process',
      desc_fr: 'Le réviseur examine chaque section et peut approuver, rejeter ou demander une correction. Le dossier est verrouillé une fois toutes les sections approuvées.',
      desc_en: 'The reviewer examines each section and can approve, reject, or request correction. The file is locked once all sections are approved.',
    },
    {
      icon: <Icons.lock />,
      title_fr: 'Verrouillage du dossier',
      title_en: 'File locking',
      desc_fr: 'Le verrouillage est irréversible sans intervention d\'un administrateur. Il génère un PDF final horodaté et cryptographiquement signé.',
      desc_en: 'Locking is irreversible without admin intervention. It generates a timestamped and cryptographically signed final PDF.',
    },
    {
      icon: <Icons.users />,
      title_fr: 'Rôles utilisateurs',
      title_en: 'User roles',
      desc_fr: 'Comptable : saisie et import. Réviseur : validation et approbation. Admin : gestion des utilisateurs et de l\'organisation. Client : lecture seule.',
      desc_en: 'Accountant: data entry and import. Reviewer: validation and approval. Admin: user and org management. Client: read-only access.',
    },
  ];

  return (
    <div>
      <PageHeader
        title={fr ? 'Centre d\'aide' : 'Help center'}
        subtitle={fr ? 'Documentation et guides d\'utilisation de Speedy OHADA Web.' : 'Documentation and usage guides for Speedy OHADA Web.'}
      />
      <div className="px-8 py-6 pb-12 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {topics.map((topic, i) => (
          <div key={i} className="bg-paper border border-line rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-rust/10 grid place-items-center text-rust flex-shrink-0">
              {topic.icon}
            </div>
            <div>
              <div className="text-[14px] font-semibold text-ink mb-1.5">{fr ? topic.title_fr : topic.title_en}</div>
              <div className="text-[12.5px] text-muted leading-relaxed">{fr ? topic.desc_fr : topic.desc_en}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
