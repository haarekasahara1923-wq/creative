'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500 text-slate-900 hover:bg-amber-400'
      }`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
