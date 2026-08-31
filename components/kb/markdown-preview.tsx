"use client";

import React from "react";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="text-muted-foreground text-sm italic py-8 text-center">
        No content to preview yet. Start typing markdown in the editor.
      </div>
    );
  }

  const renderInline = (text: string): React.ReactNode => {
    // Process markdown inline tokens: `code`, **bold**, *italic*, [link](url)
    const tokens: React.ReactNode[] = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(text.substring(lastIndex, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith("`") && matchText.endsWith("`")) {
        tokens.push(
          <code
            key={`code-${match.index}`}
            className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs"
          >
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.startsWith("**") && matchText.endsWith("**")) {
        tokens.push(
          <strong key={`bold-${match.index}`} className="font-semibold text-foreground">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith("*") && matchText.endsWith("*")) {
        tokens.push(
          <em key={`italic-${match.index}`} className="italic">
            {matchText.slice(1, -1)}
          </em>
        );
      } else if (matchText.startsWith("[")) {
        const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(matchText);
        if (linkMatch) {
          tokens.push(
            <a
              key={`link-${match.index}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              {linkMatch[1]}
            </a>
          );
        } else {
          tokens.push(matchText);
        }
      }

      lastIndex = match.index + matchText.length;
    }

    if (lastIndex < text.length) {
      tokens.push(text.substring(lastIndex));
    }

    return tokens.length > 0 ? <>{tokens}</> : text;
  };

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-inside space-y-1 my-2 text-sm text-foreground/90 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="p-3 my-3 rounded-lg bg-muted/80 text-foreground font-mono text-xs overflow-x-auto border"
          >
            <code>{codeBlockContent.join("\n")}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushList(`list-before-code-${i}`);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // List item
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      listItems.push(line.trim().substring(2));
      continue;
    } else {
      flushList(`list-before-${i}`);
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold text-foreground mt-4 mb-2 pb-1 border-b">
          {renderInline(line.substring(2))}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-semibold text-foreground mt-3 mb-1.5 pb-1 border-b">
          {renderInline(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-medium text-foreground mt-2.5 mb-1">
          {renderInline(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      // Blockquote
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-primary/50 pl-3 py-1 my-2 text-muted-foreground italic text-sm bg-muted/20 rounded-r"
        >
          {renderInline(line.substring(2))}
        </blockquote>
      );
    } else if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={`hr-${i}`} className="my-4 border-border" />);
    } else if (line.trim() === "") {
      elements.push(<div key={`space-${i}`} className="h-2" />);
    } else {
      elements.push(
        <p key={`p-${i}`} className="text-sm text-foreground/90 leading-relaxed my-1.5">
          {renderInline(line)}
        </p>
      );
    }
  }

  flushList("list-end");

  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <pre key="code-end" className="p-3 my-3 rounded-lg bg-muted/80 text-foreground font-mono text-xs overflow-x-auto border">
        <code>{codeBlockContent.join("\n")}</code>
      </pre>
    );
  }

  return <div className="space-y-1 max-w-none">{elements}</div>;
}
