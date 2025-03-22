"use client";

import { useEffect, useState, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalEditor as LEditor, EditorState } from "lexical";

import { ToolbarPlugin } from "./plugins/ToolbarPlugin";
import { CommandMenuPlugin } from "./plugins/CommandMenuPlugin";
// import { BlockPlugin } from "./plugins/BlockPlugin";
// import { BlockDecoratorPlugin } from "./plugins/BlockDecoratorPlugin";
import EditorTheme from "./themes/EditorTheme";
import { exportToHTML, importHTML } from "./utils/editorUtils";
import "./styles/Editor.css";

interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export default function LexicalEditor({
  initialContent = "",
  onChange,
  placeholder = "输入文章内容或输入 '/' 插入内容块...",
  editable = true,
}: LexicalEditorProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const editorRef = useRef<LEditor | null>(null);
  const lastInitialContentRef = useRef<string>(null);
  const lastHtmlContentRef = useRef<string>(null);

  // 初始化HTML内容
  useEffect(() => {
    if (initialContent !== lastInitialContentRef.current) {
      setHtmlContent(initialContent);
      lastInitialContentRef.current = initialContent;
      console.log("initialContent", initialContent);
      // 如果编辑器已经初始化，则重置编辑器内容
      setTimeout(() => {
        if (editorRef.current) {
          importHTML(editorRef.current, initialContent);
        }
      }, 0);
    }
  }, [initialContent]);

  // 处理编辑器内容变化
  const handleEditorChange = (editorState: EditorState, editor: LEditor) => {
    editorRef.current = editor;
    
    if (onChange) {
      editorState.read(async () => {
        // 获取HTML内容
        const html = await exportToHTML(editor);
        // 转换为Markdown并传递给父组件
        if(html !== lastHtmlContentRef.current) {
          lastHtmlContentRef.current = html;
          onChange(html);
        }
      });
    }
  };

  // 编辑器初始配置
  const initialConfig = {
    namespace: "BlogEditor",
    theme: EditorTheme,
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
    editable,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListItemNode,
      ListNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    editorState: htmlContent ? (): string => htmlContent : undefined,
  };

  return (
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable 
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
              />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin onChange={handleEditorChange} />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <CommandMenuPlugin />
            {/* <BlockPlugin />
            <BlockDecoratorPlugin /> */}
          </div>
        </div>
      </LexicalComposer>
  );
} 