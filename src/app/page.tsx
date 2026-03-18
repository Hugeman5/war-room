import dynamicImport from 'next/dynamic';
import { Loader } from 'lucide-react';

// Dynamically import the Dashboard and disable Server-Side Rendering
const Dashboard = dynamicImport(
  () => import('@/components/dashboard/dashboard'),
  {
    ssr: false,
    // Provide a loading component that matches the app's theme
    loading: () => (
      <div
        className="loading-grid-background flex h-screen w-full flex-col items-center justify-center bg-background p-4 font-body"
      >
        <Loader className="h-12 w-12 text-primary animate-spin text-glow" />
        <p className="mt-4 font-headline text-sm text-primary text-glow tracking-widest">
          INITIALIZING WAR ROOM...
        </p>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="min-h-screen">
      <Dashboard />
    </main>
  );
}
