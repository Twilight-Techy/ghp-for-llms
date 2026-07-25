'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyUrlButton() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="inline-flex items-center gap-2 px-3 py-1.5 mt-3 bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-100 rounded transition cursor-pointer"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Copy URL'}
    </button>
  );
}
