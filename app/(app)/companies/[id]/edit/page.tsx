import { CreateCompany } from '@/components/screens/CreateCompany';
import { prisma } from '@/lib/db';

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return <div className="px-8 py-12 text-muted text-[13px]">Company not found.</div>;

  return (
    <CreateCompany
      companyId={id}
      initialData={{
        name:               company.name,
        legalName:          company.legalName          ?? '',
        commercialName:     company.commercialName     ?? '',
        legalForm:          company.legalForm          ?? '',
        rccm:               company.rccm               ?? '',
        nif:                company.nif                ?? '',
        sector:             company.sector,
        mainActivity:       company.mainActivity       ?? '',
        currency:           company.currency,
        address:            company.address            ?? '',
        city:               company.city,
        country:            company.country            ?? '',
        phone:              company.phone              ?? '',
        email:              company.email              ?? '',
        website:            company.website            ?? '',
        taxCenter:          company.taxCenter          ?? '',
        taxRegime:          company.taxRegime          ?? '',
        accountingStandard: company.accountingStandard,
        managerName:        company.managerName        ?? '',
        managerTitle:       company.managerTitle       ?? '',
        accountantName:     company.accountantName     ?? '',
        accountantContact:  company.accountantContact  ?? '',
        auditorName:        company.auditorName        ?? '',
        auditorContact:     company.auditorContact     ?? '',
        notes:              company.notes              ?? '',
      }}
    />
  );
}
