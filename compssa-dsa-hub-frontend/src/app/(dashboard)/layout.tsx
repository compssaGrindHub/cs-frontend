import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
