import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function MarkdownViewer({ content }) {
  if (!content) {
    return <p className="text-slate-500 italic">Belum ada konten dokumentasi tersedia.</p>;
  }

  // Pre-process markdown into blocks
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
            <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1.5 my-3 text-slate-700">
              {listItems.map((item, idx) => (
                <li key={idx} className="leading-relaxed">{parseInline(item)}</li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1.5 my-3 text-slate-700">
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

      // Code block delimiter
      if (line.trim().startsWith('```')) {
        flushList();
        if (inCodeBlock) {
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
          <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold text-blue-900 mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="text-lg font-semibold text-blue-700 mt-5 mb-2">
            {line.substring(4)}
          </h3>
        );
      } 
      // Horizontal Rule
      else if (line.trim() === '---' || line.trim() === '***') {
        flushList();
        elements.push(<hr key={`hr-${i}`} className="my-6 border-slate-200" />);
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`bq-${i}`} className="border-l-4 border-blue-600 bg-blue-50/70 px-4 py-2.5 my-3 rounded-r text-blue-900 italic text-sm">
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
          <p key={`p-${i}`} className="text-slate-700 leading-relaxed my-2 text-sm md:text-base">
            {parseInline(line)}
          </p>
        );
      }
    }

    // Flush remaining
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
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let match;
    let lastIndex = 0;
    let keyIdx = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const token = match[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs border border-blue-200">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-800">
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
 * Code Block Component with Copy Button
 */
function CodeSnippetBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-slate-700/80 bg-[#0f172a] shadow-sm">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="uppercase text-blue-400 font-semibold">{language || 'config'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
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
      <div className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-emerald-300 leading-relaxed bg-[#090d16]">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
