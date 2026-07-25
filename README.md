# LLM-Friendly GitHub Repository Viewer 🤖

A Next.js application designed to make any GitHub repository easily readable and traversable by Large Language Models (LLMs) and AI agents. 

When you paste a link to a GitHub repository, this app dynamically generates a clean, semantic web representation of the repository's file tree and code contents. It's optimized to minimize token bloat while maximizing context for AI scrapers.

## ✨ Features

- **Dynamic Navigation:** Instantly browse any public GitHub repository via the `/[owner]/[repo]` URL structure.
- **LLM-Optimized:** Code is rendered in a flat file structure with explicit `data-filepath` markers, saving tokens by avoiding heavily nested HTML trees while making it trivial for an LLM to read.
- **Always Up to Date:** Utilizes Next.js Incremental Static Regeneration (ISR) to cache files for 5 minutes, preventing GitHub API rate limits while ensuring the code you view is always fresh.
- **Force Refresh:** Built-in UI button to manually bust the cache and fetch the absolute latest commit instantly.
- **Secure by Default:** Proactively checks repository metadata to prevent the accidental exposure of private repositories if you configure it with a privileged token.

## 🚀 Getting Started

### Prerequisites

You will need a **GitHub Personal Access Token (PAT)**. 
> **Important:** It is highly recommended to use a Fine-grained PAT restricted to **Public Repositories (read-only)**.

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Twilight-Techy/ghp-for-llms.git
   cd ghp-for-llms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env.local` file in the root of the project and add your token:
   ```env
   GITHUB_TOKEN=your_fine_grained_github_token_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌍 Deployment (Vercel)

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to your GitHub repository.
2. Import the project into your Vercel dashboard.
3. Under **Environment Variables**, add your `GITHUB_TOKEN`.
4. Click **Deploy**.

## 🧠 How LLMs Navigate This App

1. An LLM arrives at the repository root (`/[owner]/[repo]`).
2. It reads the specific LLM instructions block and parses the full flat file tree list.
3. It determines which file it needs to read and clicks the semantic link to that file (`/[owner]/[repo]/blob/[path]`).
4. It reads the source code from the clean `<pre><code>` block and can follow the "Back to File Tree" link if it needs to read something else.
