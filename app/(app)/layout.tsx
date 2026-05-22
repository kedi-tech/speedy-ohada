import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { AuthGuard } from '@/components/shell/AuthGuard';
import { WorkspaceProvider } from '@/context/WorkspaceContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['accountant', 'reviewer', 'org_admin', 'super_admin']}>
      <WorkspaceProvider>
        <div className="flex min-h-screen bg-bg">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <Topbar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </WorkspaceProvider>
    </AuthGuard>
  );
}
