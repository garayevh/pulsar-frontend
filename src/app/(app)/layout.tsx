import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-800">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden dark:bg-surface-800">
        {children}
      </main>
    </div>
  )
}
