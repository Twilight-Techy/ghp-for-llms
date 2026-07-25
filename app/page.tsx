import { redirect } from 'next/navigation';
import { GitBranch } from 'lucide-react';

export default function Home() {
  async function onSubmit(formData: FormData) {
    'use server';
    
    const urlStr = formData.get('url') as string;
    if (!urlStr) return;

    let targetPath = '';

    try {
      const url = new URL(urlStr);
      if (url.hostname === 'github.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          targetPath = `/${parts[0]}/${parts[1]}`;
        }
      }
    } catch (e) {
      // Not a valid URL, maybe it's just "owner/repo"
      const parts = urlStr.split('/').filter(Boolean);
      if (parts.length === 2) {
        targetPath = `/${parts[0]}/${parts[1]}`;
      }
    }

    // If it was a valid URL but didn't hit github.com, let's also check for "owner/repo" fallback
    if (!targetPath) {
      const parts = urlStr.split('/').filter(Boolean);
      if (parts.length === 2) {
        targetPath = `/${parts[0]}/${parts[1]}`;
      }
    }

    if (targetPath) {
      redirect(targetPath);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-950 text-zinc-50">
      <div className="max-w-xl w-full space-y-8 text-center">
        <div className="flex justify-center">
          <GitBranch className="w-16 h-16 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">LLM Repo Viewer</h1>
          <p className="text-lg text-zinc-400">
            Paste a GitHub repository link to generate an LLM-friendly codebase viewer.
          </p>
        </div>
        
        <form action={onSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full">
          <input
            type="text"
            name="url"
            placeholder="e.g., https://github.com/facebook/react"
            className="px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <button
            type="submit"
            className="px-4 py-3 bg-zinc-100 text-zinc-900 font-semibold rounded-lg hover:bg-white transition cursor-pointer"
          >
            Generate Viewer
          </button>
        </form>
      </div>
    </main>
  );
}
