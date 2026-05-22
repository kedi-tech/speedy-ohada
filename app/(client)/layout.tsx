import { AuthGuard } from '@/components/shell/AuthGuard';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['client']}>{children}</AuthGuard>;
}
