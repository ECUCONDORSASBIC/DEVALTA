import APIDashboard from '@/components/dashboard/APIDashboard';

export default function TestAliasPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Alias</h1>
      <p className="mb-4">Si puedes ver esto, los alias funcionan correctamente.</p>
      <APIDashboard />
    </div>
  );
} 