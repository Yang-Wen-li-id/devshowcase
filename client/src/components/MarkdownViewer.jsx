import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';

export default function MarkdownViewer({ content }) {
  if (!content) {
    return <p className="text-slate-400 italic">Tidak ada konten dokumentasi tersedia.</p>;
  }

  // Pre-process markdown into blocks (headers, code blocks, paragraphs, lists)
  const renderFormattedMarkdown = (markdownText) => {
    const lines = markdownText.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines = [];
    let listItems = [];
    let listType = null; // 'ul' | 'ol'

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-3 text-slate-300">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{parseInline(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-3 text-slate-300">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{parseInline(item)}</li>
              ))}
            </ul>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start / end
      if (line.trim().startsWith('```')) {
        flushList();
        if (inCodeBlock) {
          // Flush code block
          const codeString = codeLines.join('\n');
          elements.push(
            <CodeSnippetBlock 
              key={`code-${i}`} 
              language={codeLanguage || 'text'} 
              code={codeString} 
            />
          );
          inCodeBlock = false;
          codeLanguage = '';
          codeLines = [];
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, '').trim();
          codeLines = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl font-extrabold text-white mt-8 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
            <span className="w-2 h-6 rounded bg-cyan-500 inline-block" />
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold text-cyan-300 mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg font-semibold text-slate-200 mt-5 mb-2">
            {line.substring(4)}
          </h3>
        );
      } 
      // Horizontal Rule
      else if (line.trim() === '---' || line.trim() === '***') {
        flushList();
        elements.push(<hr key={`hr-${i}`} className="my-6 border-slate-800" />);
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`bq-${i}`} className="border-l-4 border-cyan-500/70 bg-cyan-950/20 px-4 py-2 my-3 rounded-r text-slate-300 italic">
            {parseInline(line.substring(2))}
          </blockquote>
        );
      }
      // Unordered list item
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        listType = 'ul';
        listItems.push(line.trim().substring(2));
      }
      // Ordered list item
      else if (/^\d+\.\s/.test(line.trim())) {
        listType = 'ol';
        listItems.push(line.trim().replace(/^\d+\.\s/, ''));
      }
      // Empty line
      else if (line.trim() === '') {
        flushList();
      }
      // Normal Paragraph
      else {
        flushList();
        elements.push(
          <p key={`p-${i}`} className="text-slate-300 leading-relaxed my-2 text-sm md:text-base">
            {parseInline(line)}
          </p>
        );
      }
    }

    // Flush any pending list or code
    flushList();
    if (inCodeBlock && codeLines.length > 0) {
      elements.push(
        <CodeSnippetBlock 
          key={`code-end`} 
          language={codeLanguage || 'text'} 
          code={codeLines.join('\n')} 
        />
      );
    }

    return elements;
  };

  // Helper to parse bold, italic, and inline code
  const parseInline = (text) => {
    const parts = [];
    let current = text;
    let keyIdx = 0;

    // Simple regex matching for `code`, **bold**, *italic*
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-200">
            {token.slice(1, -1)}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return <div className="space-y-1">{renderFormattedMarkdown(content)}</div>;
}

/**
 * Subcomponent for Code Block with Language Tag and Copy Button
 */
function CodeSnippetBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-[#040711] shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="uppercase text-cyan-300 font-semibold">{language || 'config'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Salin Kode"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-emerald-300 leading-relaxed bg-[#02050e]">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
