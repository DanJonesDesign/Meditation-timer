"use client";

import MeditationTimer from '@/components/ui/MeditationTimer';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <MeditationTimer />
      </div>
    </main>
  );
}
