"use client";

import { useEffect, useState } from "react";
import { markdownToHtml } from "./utils/editorUtils";
import "./styles/Editor.css";

interface LexicalViewerProps {
  content: string;
  className?: string;
}

export default function LexicalViewer({ content, className = "" }: LexicalViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    if (content) {
      const html = markdownToHtml(content);
      setHtmlContent(html);
    }
  }, [content]);

  return (
    <div className={`lexical-viewer ${className}`}>
      <div 
        className="editor-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
} 