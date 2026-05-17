"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[72%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground leading-relaxed">
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className="w-full font-serif text-[15px] leading-[1.8] text-foreground prose-neutral
        [&>*:first-child]:mt-0
        [&>*:last-child]:mb-0
        [&_p]:my-3
        [&_h1]:font-sans [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:mt-7 [&_h1]:mb-2
        [&_h2]:font-sans [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-2
        [&_h3]:font-sans [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-1
        [&_ul]:my-3 [&_ul]:space-y-1.5
        [&_ol]:my-3 [&_ol]:space-y-1.5
        [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal
        [&_strong]:font-semibold
        [&_em]:italic
        [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
        [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:my-4
        [&_hr]:border-border [&_hr]:my-6
        [&_table]:w-full [&_table]:my-4 [&_table]:text-sm
        [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-sans [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide
        [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5"
      >
        <ReactMarkdown
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
              >
                {children}
              </a>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
