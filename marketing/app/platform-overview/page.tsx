'use client';

import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function PlatformOverviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary transition-colors duration-500">
      <NavBar hideAuthButton={true} />
      <main className="flex-1 flex flex-col items-center justify-center py-32 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <h1 className="text-3xl font-black mb-2 relative z-10">Platform Overview</h1>
        <p className="text-text-muted text-sm font-semibold tracking-widest uppercase relative z-10">Work In Progress (WIP)</p>
      </main>
      <Footer />
    </div>
  );
}
