import { getFileContent } from '@/lib/github';
import Link from 'next/link';

import type { Metadata } from 'next';

// Revalidate this page every 5 minutes
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ owner: string; repo: string; path: string[] }> }): Promise<Metadata> {
  const { owner, repo, path } = await params;
  const filePath = path.map(decodeURIComponent).join('/');
  return {
    title: `${filePath} - ${owner}/${repo}`,
    description: `Viewing ${filePath} in ${owner}/${repo}`,
  };
}

export default async function FilePage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; path: string[] }>;
}) {
  const { owner, repo, path } = await params;
  
  // path is an array of strings like ['src', 'index.ts']
  const filePath = path.map(decodeURIComponent).join('/');
  const extension = filePath.split('.').pop()?.toLowerCase() || '';

  let content: string | null = null;
  let error: string | null = null;

  try {
    content = await getFileContent(owner, repo, filePath);
  } catch (err: any) {
    error = err.message || 'Failed to fetch file content.';
  }

  return (
    <main className="min-h-screen p-8 bg-zinc-950 text-zinc-200">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <nav className="text-sm font-mono flex items-center gap-2 text-zinc-400">
          <Link 
            href={`/${owner}/${repo}`} 
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            ← Back to File Tree ({owner}/{repo})
          </Link>
          <span>/</span>
          <span className="text-zinc-100">{filePath}</span>
        </nav>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        {!error && content !== null && (
          <article 
            className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
            data-filepath={filePath}
            data-extension={extension}
          >
            <div className="bg-zinc-800/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
              <h1 className="font-mono text-sm text-zinc-300">{filePath}</h1>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="font-mono text-sm text-zinc-300">
                <code>{content}</code>
              </pre>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
