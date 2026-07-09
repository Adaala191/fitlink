"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  link: string;
};

export default function CopyLinkButton({ link }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}