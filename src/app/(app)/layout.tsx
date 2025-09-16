
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar key="app-sidebar" />
        <div className="flex flex-col w-full sm:pl-64">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AuthWrapper>
  );
}
