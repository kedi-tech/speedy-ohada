import { CompanyProfile } from '@/components/screens/CompanyProfile';

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <CompanyProfile id={id} />;
}
