'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyButton({ relativeUrl }: { relativeUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const absoluteUrl = `${window.location.origin}${relativeUrl}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. plain-HTTP deployments); show the URL instead.
      window.prompt('Copy the public form URL:', absoluteUrl);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Copied' : 'Copy URL'}
    </Button>
  );
}
