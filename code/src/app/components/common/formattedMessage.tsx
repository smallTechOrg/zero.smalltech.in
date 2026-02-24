"use client";
import { useMemo } from "react";
import { marked } from "marked";

// Configure marked for chat: no async, sanitize output
marked.setOptions({
  async: false,
  breaks: true, // Convert single \n to <br>
  gfm: true,
});

/**
 * Renders chat text as formatted markdown (bold, italic, lists, headings, etc.).
 * Uses `marked` for parsing. HTML in source text is escaped by marked.
 */
export default function FormattedMessage({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => marked.parse(text) as string, [text]);
  return (
    <div
      className={className}
      style={{ display: "inline" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
