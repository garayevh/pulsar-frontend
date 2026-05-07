import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}