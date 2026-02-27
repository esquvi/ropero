import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userData = {
    email: user.email,
    name: user.user_metadata?.name as string | undefined,
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={userData} />
        <main className="flex-1 overflow-auto bg-zinc-50 p-4 dark:bg-zinc-950 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
