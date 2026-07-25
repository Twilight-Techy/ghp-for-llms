import { Octokit } from "octokit";

// Initialize Octokit with a token if available to avoid aggressive rate limits
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface FileNode {
  path: string;
  mode: string;
  type: "tree" | "blob" | "commit";
  sha: string;
  size?: number;
  url: string;
}

/**
 * Checks if a file path is likely a binary file or something we shouldn't render
 */
function isRenderable(path: string): boolean {
  const extension = path.split('.').pop()?.toLowerCase() || '';
  const ignoredExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 
    'woff', 'woff2', 'ttf', 'eot', 'otf',
    'mp4', 'webm', 'ogg', 'mp3', 'wav', 'flac',
    'zip', 'tar', 'gz', 'bz2', '7z', 'rar',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'exe', 'dll', 'so', 'dylib', 'bin', 'dmg', 'iso',
    'wasm', 'class', 'jar', 'pyc', 'pyo', 'pyd',
    'lock', // e.g. package-lock.json, yarn.lock
  ];
  
  if (ignoredExtensions.includes(extension)) return false;
  
  // Ignore specific directories entirely
  if (path.includes('node_modules/') || path.includes('.git/')) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a repository is public before allowing access.
 * This prevents accidental exposure of private repos if a privileged PAT is used.
 */
async function ensurePublicRepo(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    if (data.private) {
      throw new Error(`Repository ${owner}/${repo} is private. Access denied.`);
    }
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found.`);
    }
    throw error;
  }
}

/**
 * Fetches the recursive file tree for the repository's default branch.
 */
export async function getRepoTree(owner: string, repo: string): Promise<FileNode[]> {
  try {
    await ensurePublicRepo(owner, repo);

    // We use "HEAD" to get the tree of the default branch
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: "HEAD",
      recursive: "true",
    });

    if (!data.tree) return [];

    // Filter to only blobs (files) and tree (directories) that we care about
    return (data.tree as FileNode[]).filter(node => {
      // Only keep renderable files
      if (node.type === "blob" && !isRenderable(node.path)) {
        return false;
      }
      return true;
    });
  } catch (error) {
    console.error("Error fetching repo tree:", error);
    throw new Error(`Failed to fetch repository tree for ${owner}/${repo}`);
  }
}

/**
 * Fetches the README content for the repository.
 */
export async function getRepoReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      mediaType: {
        format: "raw", // Fetch raw markdown
      },
    });
    
    // When using mediaType: { format: "raw" }, data is returned as the string content directly.
    return data as unknown as string;
  } catch (error: any) {
    if (error.status === 404) return null;
    console.error("Error fetching readme:", error);
    return null;
  }
}

/**
 * Fetches the raw content of a specific file.
 */
export async function getFileContent(owner: string, repo: string, path: string): Promise<string> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      mediaType: {
        format: "raw",
      },
    });

    return data as unknown as string;
  } catch (error) {
    console.error("Error fetching file content:", error);
    throw new Error(`Failed to fetch file content for ${owner}/${repo}/${path}`);
  }
}
