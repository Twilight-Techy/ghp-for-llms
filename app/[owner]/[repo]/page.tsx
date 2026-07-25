import { getRepoTree, getRepoReadme, FileNode } from '@/lib/github';
import RefreshButton from '@/components/RefreshButton';
import Link from 'next/link';

import type { Metadata } from 'next';

// Revalidate this page every 5 minutes (300 seconds)
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ owner: string; repo: string }> }): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} - LLM Repo Viewer`,
    description: `Codebase viewer for ${owner}/${repo}`,
  };
}

export default async function RepoRootPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;

  let tree: FileNode[] = [];
  let readme: string | null = null;
  let error: string | null = null;

  try {
    const [treeData, readmeData] = await Promise.all([
      getRepoTree(owner, repo),
      getRepoReadme(owner, repo),
    ]);
    tree = treeData;
    readme = readmeData;
  } catch (err: any) {
    error = err.message || 'Failed to fetch repository data.';
  }

  // Create a structured tree for rendering if needed, or just render flat links.
  // A flat list of links to blobs is often perfectly sufficient and uses fewer tokens
  // but a nested list might be better. Let's just output a clean list of files.
  const files = tree.filter(n => n.type === 'blob');

  return (
    <main className="min-h-screen p-8 bg-zinc-950 text-zinc-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold">
              {owner} / {repo}
            </h1>
            <p className="text-zinc-400 mt-2">LLM-Friendly Codebase Viewer</p>
          </div>
          <RefreshButton owner={owner} repo={repo} />
        </header>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        {/* User Instructions */}
        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">Instructions for Users 🧑‍💻</h2>
          <p className="text-zinc-300 leading-relaxed">
            This page provides a machine-readable format of the <strong>{owner}/{repo}</strong> codebase. 
            To use this with an AI assistant (like ChatGPT or Claude), simply provide it with this URL and tell it to scrape the page. 
            The AI will use the file tree below to navigate and read your source code!
          </p>
        </section>

        {/* LLM Instructions */}
        <section className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-300 mb-2">Instructions for LLM Agents 🤖</h2>
          <p className="text-zinc-300 leading-relaxed">
            You are viewing an interactive representation of the <strong>{owner}/{repo}</strong> GitHub repository.
            Below is the full file tree of the project. To read the source code of any file, follow the link corresponding to its path.
            Use this file tree as an index to traverse the codebase and answer the user's questions.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* File Tree */}
          <nav className="md:col-span-1 bg-zinc-900 border border-zinc-800 p-4 rounded-lg h-fit max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-zinc-100">File Tree</h2>
            <ul className="space-y-1 text-sm font-mono">
              {files.map((file) => (
                <li key={file.path}>
                  <Link 
                    href={`/${owner}/${repo}/blob/${file.path}`}
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {file.path}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* README */}
          <article className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-lg overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4 text-zinc-100">README.md</h2>
            {readme ? (
              <pre className="whitespace-pre-wrap font-sans text-zinc-300">{readme}</pre>
            ) : (
              <p className="text-zinc-500 italic">No README found or unable to fetch.</p>
            )}
          </article>

        </div>
      </div>
    </main>
  );
}
