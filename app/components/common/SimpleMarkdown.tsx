'use client';

import React from 'react';

type SimpleMarkdownProps = {
  content: string;
  className?: string;
};

export default function SimpleMarkdown({ content, className = '' }: SimpleMarkdownProps) {
  // If content is empty, return null
  if (!content) return null;

  // Process the markdown content
  const processedContent = React.useMemo(() => {
    // Function to escape HTML to prevent injection
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    
    // First, escape the HTML in the entire content
    let html = escapeHtml(content);
    
    // Store code blocks separately to prevent processing their contents
    const codeBlocks: string[] = [];
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      
      // Try to detect language from first line
      const firstLine = code.trim().split('\n')[0];
      const hasLanguage = firstLine && !firstLine.includes(' ') && firstLine.length < 20;
      
      let language = '';
      let codeContent = code;
      
      if (hasLanguage) {
        language = firstLine;
        codeContent = code.substring(firstLine.length).trim();
      }
      
      const languageLabel = language ? `<div class="text-xs text-gray-500 mb-0.5">${language}</div>` : '';
      
      codeBlocks.push(
        `<div class="relative">
          ${languageLabel}
          <pre class="bg-gray-800 text-gray-100 p-2 rounded-md my-2 overflow-x-auto font-mono text-sm">
            <code>${codeContent}</code>
          </pre>
        </div>`
      );
      
      return id;
    });
    
    // Store inline code separately too
    const inlineCodes: string[] = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      const id = `__INLINE_CODE_${inlineCodes.length}__`;
      inlineCodes.push(`<code class="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">${code}</code>`);
      return id;
    });

    // Process headings - with reduced spacing
    html = html.replace(/^##### (.*$)/gm, '<h5 class="text-sm font-bold mt-2 mb-1">$1</h5>');
    html = html.replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold mt-2 mb-1">$1</h4>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-3 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-3 mb-2">$1</h1>');

    // Process horizontal rules
    html = html.replace(/^\s*\-{3,}\s*$/gm, '<hr class="my-3 border-t border-gray-300 dark:border-gray-700" />');

    // Process blockquotes - simpler style
    html = html.replace(/^\s*>\s*(.*)$/gm, '<blockquote class="border-l-2 border-gray-300 dark:border-gray-600 pl-2 py-0.5 my-2 text-gray-700 dark:text-gray-300">$1</blockquote>');

    // Bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\_\_([^_]+)\_\_/g, '<strong>$1</strong>');

    // Italic text
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\_([^_]+)\_/g, '<em>$1</em>');

    // Process unordered lists - more compact
    html = html.replace(/^\s*[\*\-]\s+(.*)$/gm, '<li>$1</li>');
    
    // Wrap adjacent list items in ul tags
    let inList = false;
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('<li>')) {
        if (!inList) {
          lines[i] = '<ul class="list-disc pl-4 my-2 space-y-0.5">' + lines[i];
          inList = true;
        }
      } else if (inList) {
        lines[i-1] = lines[i-1] + '</ul>';
        inList = false;
      }
    }
    if (inList) {
      lines[lines.length-1] = lines[lines.length-1] + '</ul>';
    }
    html = lines.join('\n');

    // Process ordered lists
    html = html.replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li class="ml-1">$2</li>');
    
    // Process links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert \n to <br> for remaining line breaks (but not in lists/blockquotes)
    html = html.replace(/\n/g, '<br/>');

    // Restore code blocks
    codeBlocks.forEach((block, i) => {
      html = html.replace(`__CODE_BLOCK_${i}__`, block);
    });
    
    // Restore inline code
    inlineCodes.forEach((code, i) => {
      html = html.replace(`__INLINE_CODE_${i}__`, code);
    });

    return html;
  }, [content]);

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
} 