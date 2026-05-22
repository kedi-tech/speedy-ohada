'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Lang } from '@/lib/i18n';

const LANG_STORE_KEY = 'speedy_lang';

function useLang() {
  const [lang, setLangState] = useState<Lang>('fr');
  useEffect(() => {
    const stored = localStorage.getItem(LANG_STORE_KEY) as Lang | null;
    if (stored) setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_STORE_KEY, l);
  };
  const fr = lang === 'fr';
  return { lang, setLang, fr };
}

const FEATURES = [
  {
    icon: '📥',
    fr: { title: 'Import de balance flexible', body: 'Importez votre balance au format Excel ou CSV. Détection automatique des colonnes, aperçu des données, validation instantanée.' },
    en: { title: 'Flexible balance import', body: 'Import your trial balance in Excel or CSV. Automatic column detection, data preview, instant validation.' },
  },
  {
    icon: '🔗',
    fr: { title: 'Affectation automatique SYSCOHADA', body: 'Le moteur mappe automatiquement vos comptes aux postes du référentiel SYSCOHADA révisé. Supervision et correction manuelle incluses.' },
    en: { title: 'Automatic SYSCOHADA mapping', body: 'The engine automatically maps your accounts to SYSCOHADA reference positions. Manual supervision and correction included.' },
  },
  {
    icon: '📊',
    fr: { title: 'États financiers complets', body: 'Actif, Passif, Bilan, Compte de résultat, Tableau des flux de trésorerie — générés en un clic depuis la balance affectée.' },
    en: { title: 'Complete financial statements', body: 'Assets, Liabilities, Balance Sheet, Income Statement, Cash Flow — generated in one click from the mapped balance.' },
  },
  {
    icon: '📝',
    fr: { title: 'Notes annexes 1 à 36', body: "Complétez les 36 notes annexes SYSCOHADA avec données pré-remplies, tableaux de support et éditeur de texte riche." },
    en: { title: 'Annex notes 1 to 36', body: 'Complete all 36 SYSCOHADA annex notes with pre-filled data, supporting tables and rich text editor.' },
  },
  {
    icon: '✅',
    fr: { title: 'Centre de validation intelligent', body: 'Contrôle automatique de la conformité : équilibre de la balance, cohérence des états, notes manquantes, données fiscales.' },
    en: { title: 'Smart validation center', body: 'Automatic compliance checks: balance equilibrium, statement consistency, missing notes, tax data completeness.' },
  },
  {
    icon: '👥',
    fr: { title: 'Workflow de révision et approbation', body: "Assignez un réviseur, commentez section par section, approuvez ou demandez des corrections. Historique complet des actions." },
    en: { title: 'Review & approval workflow', body: 'Assign a reviewer, comment section by section, approve or request corrections. Complete action history.' },
  },
  {
    icon: '📤',
    fr: { title: 'Export PDF & Excel professionnel', body: 'Exportez le dossier complet ou des états individuels en PDF signé, Excel éditable ou package ZIP. Version archivée automatiquement.' },
    en: { title: 'Professional PDF & Excel export', body: 'Export the complete package or individual statements as signed PDF, editable Excel or ZIP package. Automatically versioned archive.' },
  },
  {
    icon: '🔒',
    fr: { title: 'Sécurité et multi-organisation', body: 'Architecture multi-tenant sécurisée. Chaque cabinet ou entreprise accède uniquement à ses propres données. RBAC intégré.' },
    en: { title: 'Security & multi-organization', body: 'Secure multi-tenant architecture. Each firm or company accesses only its own data. Built-in RBAC.' },
  },
];

const STEPS = [
  { fr: 'Créez une société', en: 'Create a company' },
  { fr: "Créez l'exercice comptable", en: 'Create the fiscal year' },
  { fr: 'Importez la balance N', en: 'Import Balance N' },
  { fr: 'Importez la balance N-1', en: 'Import Balance N-1' },
  { fr: 'Validez les données', en: 'Validate data' },
  { fr: 'Affectez les comptes', en: 'Map accounts' },
  { fr: 'Générez les états financiers', en: 'Generate financial statements' },
  { fr: 'Complétez les notes annexes', en: 'Complete annex notes' },
  { fr: 'Révisez et approuvez', en: 'Review and approve' },
  { fr: 'Exportez le dossier final', en: 'Export the final package' },
];

const PLANS = [
  { id: 'starter', fr: { name: 'Démarrage', price: '250 000', features: ['1 société', '1 utilisateur', 'États financiers de base', 'Export PDF'] }, en: { name: 'Starter', price: '250,000', features: ['1 company', '1 user', 'Basic financial statements', 'PDF export'] } },
  { id: 'pro', popular: true, fr: { name: 'Professionnel', price: '450 000', features: ['10 sociétés', '5 utilisateurs', 'États complets + Notes', 'PDF & Excel', 'Révision & Approbation', "Journal d'audit"] }, en: { name: 'Professional', price: '450,000', features: ['10 companies', '5 users', 'Full statements + Notes', 'PDF & Excel', 'Review & Approval', 'Audit logs'] } },
  { id: 'cabinet', fr: { name: 'Cabinet', price: '900 000', features: ['Sociétés illimitées', '20 utilisateurs', 'Portail client', 'Modules fiscaux complets', 'Historique des versions', 'Marque personnalisée'] }, en: { name: 'Firm', price: '900,000', features: ['Unlimited companies', '20 users', 'Client portal', 'Full tax modules', 'Version history', 'Custom branding'] } },
];

const FAQS = [
  {
    fr: { q: 'Dois-je importer mes écritures comptables ?', a: "Non. Speedy OHADA Web travaille uniquement à partir d'une balance générale déjà préparée dans votre logiciel comptable. Il n'a pas besoin d'accéder à votre comptabilité." },
    en: { q: 'Do I need to import my journal entries?', a: 'No. Speedy OHADA Web only works from an already prepared trial balance from your accounting software. It does not need access to your bookkeeping.' },
  },
  {
    fr: { q: 'Quels formats de balance sont acceptés ?', a: 'Le système accepte les fichiers Excel (.xlsx, .xls) et CSV. Un assistant détecte automatiquement les colonnes. Un modèle de balance est disponible en téléchargement.' },
    en: { q: 'What balance formats are accepted?', a: 'The system accepts Excel files (.xlsx, .xls) and CSV. A wizard automatically detects columns. A balance template is available for download.' },
  },
  {
    fr: { q: 'Les macros Excel sont-elles exécutées ?', a: "Non. Le système extrait uniquement les données tabulaires du fichier. Aucune macro n'est exécutée. Les fichiers .xlsm sont traités comme données uniquement." },
    en: { q: 'Are Excel macros executed?', a: 'No. The system only extracts tabular data from the file. No macros are executed. .xlsm files are treated as data-only.' },
  },
  {
    fr: { q: 'Le Total Actif doit-il être égal au Total Passif ?', a: 'Oui, c\'est une règle critique SYSCOHADA. Le système bloque l\'exportation finale si Actif ≠ Passif. Une vérification automatique est effectuée à chaque génération.' },
    en: { q: 'Must Total Assets equal Total Liabilities?', a: "Yes, this is a critical SYSCOHADA rule. The system blocks final export if Assets ≠ Liabilities & Equity. An automatic check is performed at every generation." },
  },
  {
    fr: { q: 'Puis-je générer des états pour plusieurs exercices ?', a: 'Oui. Chaque société peut avoir plusieurs exercices comptables. La comparaison N/N-1 est automatique lorsque les deux balances sont importées.' },
    en: { q: 'Can I generate statements for multiple fiscal years?', a: 'Yes. Each company can have multiple fiscal years. N/N-1 comparison is automatic when both balances are imported.' },
  },
  {
    fr: { q: 'Mes données sont-elles partagées entre cabinets ?', a: "Non. L'architecture est multi-tenant : chaque organisation accède exclusivement à ses propres données. Aucune donnée n'est visible par d'autres organisations." },
    en: { q: 'Is my data shared between firms?', a: 'No. The architecture is multi-tenant: each organization exclusively accesses its own data. No data is visible to other organizations.' },
  },
];

const TARGETS = [
  { icon: '🏢', fr: { title: 'Cabinets comptables', body: 'Gérez tous vos clients, exercices et dossiers depuis un seul espace. Workflow de révision intégré.' }, en: { title: 'Accounting firms', body: 'Manage all your clients, fiscal years and files from one workspace. Built-in review workflow.' } },
  { icon: '🔍', fr: { title: 'Auditeurs & réviseurs', body: 'Révisez les dossiers section par section, annotez, approuvez ou demandez des corrections.' }, en: { title: 'Auditors & reviewers', body: 'Review files section by section, annotate, approve or request corrections.' } },
  { icon: '🏭', fr: { title: 'Entreprises & DAF', body: 'Préparez vos propres états financiers SYSCOHADA sans dépendre entièrement de votre cabinet.' }, en: { title: 'Companies & CFOs', body: 'Prepare your own SYSCOHADA financial statements without relying entirely on your accounting firm.' } },
  { icon: '🎓', fr: { title: 'Formateurs & étudiants', body: "Utilisez des données réelles pour apprendre le référentiel SYSCOHADA de manière guidée et pratique." }, en: { title: 'Trainers & students', body: 'Use real data to learn SYSCOHADA standards in a guided and practical way.' } },
];

export function LandingPage() {
  const { lang, setLang, fr } = useLang();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans text-[#1C1917]">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#E7E5E4] px-6 h-14 flex items-center gap-4">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-[#EA580C] to-[#C2410C] grid place-items-center text-white font-bold text-sm font-serif shadow-[0_2px_6px_rgb(194_65_12/0.25)]">S</div>
          <span className="font-bold text-[#1C1917] font-serif">Speedy <span className="text-[#EA580C]">OHADA</span> <span className="text-[12px] font-normal text-[#78716C]">Web</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#57534E]">
          <a href="#features" className="hover:text-[#1C1917] transition-colors">{fr ? 'Fonctionnalités' : 'Features'}</a>
          <a href="#how" className="hover:text-[#1C1917] transition-colors">{fr ? 'Comment ça marche' : 'How it works'}</a>
          <a href="#pricing" className="hover:text-[#1C1917] transition-colors">{fr ? 'Tarifs' : 'Pricing'}</a>
          <a href="#faq" className="hover:text-[#1C1917] transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg p-0.5">
            {(['fr', 'en'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-[11.5px] font-semibold rounded-md uppercase tracking-[.05em] transition-all ${lang === l ? 'bg-white text-[#EA580C] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link href="/login" className="text-[13px] font-medium text-[#57534E] hover:text-[#1C1917] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F4] transition-colors no-underline">
            {fr ? 'Connexion' : 'Login'}
          </Link>
          <Link href="/register" className="text-[13px] font-semibold bg-[#EA580C] text-white px-4 py-2 rounded-lg hover:bg-[#C2410C] transition-colors no-underline shadow-[0_1px_3px_rgb(194_65_12/0.3)]">
            {fr ? 'Commencer' : 'Get started'}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] text-[12px] font-semibold px-3 py-1.5 rounded-full mb-6 tracking-[.04em] uppercase">
          <span>✦</span> SYSCOHADA Révisé · OHADA 2024
        </div>
        <h1 className="text-[42px] md:text-[56px] font-bold text-[#1C1917] leading-[1.1] tracking-[-0.02em] mb-6 font-serif">
          {fr ? (
            <>Générez vos états financiers<br /><span className="text-[#EA580C]">OHADA</span> en quelques minutes</>
          ) : (
            <>Generate your OHADA<br /><span className="text-[#EA580C]">financial statements</span> in minutes</>
          )}
        </h1>
        <p className="text-[17px] text-[#57534E] leading-relaxed max-w-2xl mx-auto mb-10">
          {fr
            ? "Speedy OHADA Web permet aux comptables, cabinets, auditeurs et entreprises d'importer une balance, de valider les données, de générer les états financiers SYSCOHADA et d'exporter des rapports professionnels."
            : 'Speedy OHADA Web helps accountants, firms, auditors, and companies import trial balances, validate data, generate SYSCOHADA financial statements, and export professional reports.'}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#EA580C] text-white font-semibold text-[15px] px-6 py-3 rounded-xl hover:bg-[#C2410C] transition-colors no-underline shadow-[0_4px_12px_rgb(194_65_12/0.3)]">
            {fr ? 'Commencer gratuitement' : 'Start for free'} →
          </Link>
          <a href="#how" className="inline-flex items-center gap-2 bg-white border border-[#E7E5E4] text-[#57534E] font-medium text-[15px] px-6 py-3 rounded-xl hover:bg-[#F5F5F4] transition-colors no-underline shadow-sm">
            {fr ? 'Voir comment ça marche' : 'See how it works'}
          </a>
        </div>
        <p className="text-[12px] text-[#A8A29E] mt-4">
          {fr ? 'Aucune carte bancaire requise · Accès immédiat · Données sécurisées' : 'No credit card required · Instant access · Secure data'}
        </p>
      </section>

      {/* Problem */}
      <section className="px-6 py-16 bg-[#1C1917] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[30px] font-bold font-serif mb-3">
              {fr ? 'Le problème que vous connaissez bien' : 'The problem you know all too well'}
            </h2>
            <p className="text-[#A8A29E] text-[15px]">
              {fr ? 'La préparation des états financiers SYSCOHADA dans Excel est complexe, longue et risquée.' : 'Preparing SYSCOHADA financial statements in Excel is complex, time-consuming and risky.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '😰', fr: 'Les tableurs Excel sont fragiles et les formules se cassent facilement.', en: 'Excel spreadsheets are fragile and formulas break easily.' },
              { icon: '⏱️', fr: "L'affectation manuelle des comptes prend des heures.", en: 'Manual account mapping takes hours.' },
              { icon: '❌', fr: 'Les erreurs de calcul passent inaperçues jusqu\'à la révision finale.', en: 'Calculation errors go unnoticed until final review.' },
              { icon: '📋', fr: 'Les 36 notes annexes sont difficiles à gérer sans outil dédié.', en: 'All 36 annex notes are hard to manage without a dedicated tool.' },
              { icon: '🔄', fr: 'La comparaison N/N-1 est fastidieuse à maintenir manuellement.', en: 'The N/N-1 comparison is tedious to maintain manually.' },
              { icon: '📑', fr: 'Le rapport final doit être conforme, imprimable et prêt à déposer.', en: 'The final report must be compliant, printable and ready to file.' },
            ].map((p, i) => (
              <div key={i} className="bg-[#292524] rounded-xl p-5 border border-[#44403C]">
                <div className="text-2xl mb-3">{p.icon}</div>
                <p className="text-[14px] text-[#D6D3D1] leading-relaxed">{fr ? p.fr : p.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[30px] font-bold font-serif mb-4 text-[#1C1917]">
            {fr ? 'La solution Speedy OHADA Web' : 'The Speedy OHADA Web solution'}
          </h2>
          <p className="text-[#57534E] text-[15px] mb-12 max-w-2xl mx-auto">
            {fr ? 'Un workflow guidé, de l\'import de la balance jusqu\'à l\'export du dossier final certifié.' : 'A guided workflow, from balance import to the export of the final certified package.'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: '📥', fr: 'Importez la balance', en: 'Import the balance' },
              { icon: '✔️', fr: 'Validez automatiquement', en: 'Validate automatically' },
              { icon: '🔗', fr: 'Affectez les comptes', en: 'Map accounts' },
              { icon: '📊', fr: 'Générez les états', en: 'Generate statements' },
              { icon: '👁️', fr: 'Révisez et approuvez', en: 'Review and approve' },
              { icon: '📤', fr: 'Exportez les rapports', en: 'Export reports' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-[#E7E5E4] rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-[13.5px] font-semibold text-[#1C1917]">{fr ? s.fr : s.en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 bg-[#F5F5F4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[30px] font-bold font-serif text-[#1C1917] mb-3">
              {fr ? 'Fonctionnalités complètes' : 'Complete feature set'}
            </h2>
            <p className="text-[#57534E] text-[15px]">
              {fr ? 'Tout ce dont vous avez besoin pour préparer un dossier SYSCOHADA professionnel.' : 'Everything you need to prepare a professional SYSCOHADA file.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-[#E7E5E4] shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-[14px] text-[#1C1917] mb-2">{fr ? f.fr.title : f.en.title}</h3>
                <p className="text-[12.5px] text-[#57534E] leading-relaxed">{fr ? f.fr.body : f.en.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[30px] font-bold font-serif text-[#1C1917] mb-3">
              {fr ? 'Comment ça marche' : 'How it works'}
            </h2>
            <p className="text-[#57534E] text-[15px]">
              {fr ? 'Un processus guidé de bout en bout, sans improvisation.' : 'A guided end-to-end process, no improvisation.'}
            </p>
          </div>
          <div className="relative">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-4 mb-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0 z-10">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 bg-[#E7E5E4] mt-1" style={{ minHeight: '16px' }} />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="bg-white border border-[#E7E5E4] rounded-xl px-4 py-3 text-[13.5px] font-medium text-[#1C1917] shadow-sm">
                    {fr ? step.fr : step.en}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target users */}
      <section className="px-6 py-16 bg-[#FFF7ED]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[30px] font-bold font-serif text-[#1C1917] text-center mb-10">
            {fr ? 'Pour qui ?' : 'Who is it for?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TARGETS.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-[#FED7AA] shadow-sm text-center">
                <div className="text-3xl mb-3">{t.icon}</div>
                <h3 className="font-bold text-[14px] text-[#1C1917] mb-2">{fr ? t.fr.title : t.en.title}</h3>
                <p className="text-[12.5px] text-[#57534E] leading-relaxed">{fr ? t.fr.body : t.en.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[30px] font-bold font-serif text-[#1C1917] mb-3">
              {fr ? 'Tarifs simples et transparents' : 'Simple, transparent pricing'}
            </h2>
            <p className="text-[#57534E] text-[15px]">
              {fr ? 'Commencez gratuitement. Passez au plan supérieur quand vous êtes prêt.' : 'Start for free. Upgrade when ready.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <div key={p.id} className={`rounded-2xl p-6 border relative ${p.popular ? 'bg-[#EA580C] text-white border-[#C2410C] shadow-[0_8px_24px_rgb(194_65_12/0.3)]' : 'bg-white border-[#E7E5E4] shadow-sm'}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1C1917] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-[.08em]">
                    {fr ? 'Populaire' : 'Popular'}
                  </div>
                )}
                <div className={`text-[13px] font-semibold uppercase tracking-[.08em] mb-2 ${p.popular ? 'text-[#FED7AA]' : 'text-[#EA580C]'}`}>
                  {fr ? p.fr.name : p.en.name}
                </div>
                <div className={`text-[32px] font-bold font-serif mb-1 ${p.popular ? 'text-white' : 'text-[#1C1917]'}`}>
                  {fr ? p.fr.price : p.en.price}
                  <span className={`text-[14px] font-normal ml-1 ${p.popular ? 'text-[#FED7AA]' : 'text-[#78716C]'}`}>GNF/mois</span>
                </div>
                <ul className="mt-4 mb-6 space-y-2">
                  {(fr ? p.fr.features : p.en.features).map((feat, fi) => (
                    <li key={fi} className={`flex items-start gap-2 text-[13px] ${p.popular ? 'text-[#FFF7ED]' : 'text-[#57534E]'}`}>
                      <span className={`mt-0.5 flex-shrink-0 ${p.popular ? 'text-[#FED7AA]' : 'text-[#EA580C]'}`}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`block text-center font-semibold text-[13.5px] py-2.5 rounded-xl no-underline transition-colors ${p.popular ? 'bg-white text-[#EA580C] hover:bg-[#FFF7ED]' : 'bg-[#EA580C] text-white hover:bg-[#C2410C]'}`}>
                  {fr ? 'Commencer' : 'Get started'}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-[#A8A29E] mt-6">
            {fr ? 'Plan Entreprise disponible sur devis · Marque blanche · API · Support prioritaire' : 'Enterprise plan available on request · White label · API · Priority support'}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-16 bg-[#F5F5F4]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[30px] font-bold font-serif text-[#1C1917] text-center mb-10">
            {fr ? 'Questions fréquentes' : 'Frequently asked questions'}
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white border border-[#E7E5E4] rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-[14px] text-[#1C1917]">{fr ? f.fr.q : f.en.q}</span>
                  <span className={`text-[#EA580C] text-[18px] transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4 text-[13.5px] text-[#57534E] leading-relaxed border-t border-[#F5F5F4]">
                    {fr ? f.fr.a : f.en.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[30px] font-bold font-serif text-[#1C1917] mb-3">
            {fr ? 'Demander une démo' : 'Request a demo'}
          </h2>
          <p className="text-[#57534E] text-[15px] mb-8">
            {fr ? 'Notre équipe vous contacte sous 24 h pour une démonstration personnalisée.' : 'Our team will contact you within 24 hours for a personalized demonstration.'}
          </p>
          {contactSent ? (
            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-8 text-center">
              <div className="text-3xl mb-3">✅</div>
              <div className="font-semibold text-[#166534] text-[15px]">
                {fr ? 'Message envoyé ! Nous vous répondrons sous 24 h.' : 'Message sent! We will reply within 24 hours.'}
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setContactSent(true); }} className="space-y-4 text-left">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#1C1917] mb-1.5">{fr ? 'Nom complet' : 'Full name'}</label>
                <input required value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E7E5E4] rounded-lg text-[13px] outline-none focus:border-[#EA580C] bg-white" />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#1C1917] mb-1.5">{fr ? 'Email professionnel' : 'Work email'}</label>
                <input required type="email" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E7E5E4] rounded-lg text-[13px] outline-none focus:border-[#EA580C] bg-white" />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#1C1917] mb-1.5">{fr ? 'Message' : 'Message'}</label>
                <textarea required rows={4} value={contactForm.message} onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                  placeholder={fr ? 'Décrivez vos besoins (nombre de sociétés, cas d\'usage…)' : 'Describe your needs (number of companies, use case…)'}
                  className="w-full px-3 py-2.5 border border-[#E7E5E4] rounded-lg text-[13px] outline-none focus:border-[#EA580C] bg-white resize-none" />
              </div>
              <button type="submit" className="w-full bg-[#EA580C] text-white font-semibold text-[14px] py-3 rounded-xl hover:bg-[#C2410C] transition-colors shadow-[0_4px_12px_rgb(194_65_12/0.3)]">
                {fr ? 'Envoyer ma demande' : 'Send my request'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1C1917] text-[#A8A29E] px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-[#EA580C] to-[#C2410C] grid place-items-center text-white font-bold text-sm font-serif">S</div>
                <span className="font-bold text-white font-serif">Speedy <span className="text-[#EA580C]">OHADA</span> Web</span>
              </div>
              <p className="text-[12.5px] leading-relaxed max-w-[280px]">
                {fr ? 'Plateforme de génération des états financiers OHADA/SYSCOHADA pour l\'Afrique subsaharienne.' : 'OHADA/SYSCOHADA financial statement generation platform for Sub-Saharan Africa.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-[13px]">
              <div>
                <div className="text-white font-semibold mb-3">{fr ? 'Produit' : 'Product'}</div>
                <div className="space-y-2">
                  <a href="#features" className="block hover:text-white transition-colors">{fr ? 'Fonctionnalités' : 'Features'}</a>
                  <a href="#pricing" className="block hover:text-white transition-colors">{fr ? 'Tarifs' : 'Pricing'}</a>
                  <a href="#faq" className="block hover:text-white transition-colors">FAQ</a>
                </div>
              </div>
              <div>
                <div className="text-white font-semibold mb-3">{fr ? 'Compte' : 'Account'}</div>
                <div className="space-y-2">
                  <Link href="/login" className="block hover:text-white transition-colors no-underline text-[#A8A29E]">{fr ? 'Connexion' : 'Login'}</Link>
                  <Link href="/register" className="block hover:text-white transition-colors no-underline text-[#A8A29E]">{fr ? 'Créer un compte' : 'Register'}</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-[#292524] flex items-center justify-between text-[12px]">
            <span>© 2026 Speedy OHADA Web · {fr ? 'Tous droits réservés' : 'All rights reserved'}</span>
            <span className="text-[#EA580C] font-semibold">SYSCOHADA Révisé</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
