import { Header } from '@/components/layout/Header'

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" subtitle="Select pages to start a new analysis" />
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-surface-400 text-sm">— Page selection coming next —</p>
      </div>
    </>
  )
}