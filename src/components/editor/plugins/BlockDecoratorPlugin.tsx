"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isListNode, ListNode } from "@lexical/list";
import { $isParagraphNode } from "lexical";

export function BlockDecoratorPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 添加块装饰样式
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      /* 段落块样式 */
      .editor-paragraph {
        margin: 0.5rem 0;
        position: relative;
        min-height: 1.5rem;
      }
      
      /* 标题块样式 */
      .editor-heading-h1, .editor-heading-h2, .editor-heading-h3 {
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        position: relative;
      }
      
      /* 列表项样式 */
      .editor-listitem {
        margin: 0.25rem 0;
        position: relative;
      }
      
      /* 空块占位符 */
      .editor-paragraph:empty::before {
        content: '点击输入文字或输入 "/" 插入内容...';
        color: #9ca3af;
        position: absolute;
        pointer-events: none;
        user-select: none;
      }
      
      /* 块的悬停状态 */
      .editor-paragraph:hover, 
      .editor-heading-h1:hover, 
      .editor-heading-h2:hover, 
      .editor-heading-h3:hover,
      .editor-listitem:hover {
        background-color: rgba(241, 245, 249, 0.5);
      }
      
      /* 添加左侧的块控制区域 */
      .editor-paragraph::before,
      .editor-heading-h1::before,
      .editor-heading-h2::before,
      .editor-heading-h3::before,
      .editor-listitem::before {
        content: '';
        position: absolute;
        left: -1.5rem;
        top: 0.25rem;
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .editor-paragraph:hover::before,
      .editor-heading-h1:hover::before,
      .editor-heading-h2:hover::before,
      .editor-heading-h3:hover::before,
      .editor-listitem:hover::before {
        opacity: 0.5;
        background-color: #cbd5e1;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // 清理函数
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // 注册DOM节点转换
  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(ListNode, (node) => {
      // 列表节点的转换处理
      // 可以在这里添加自定义的列表行为
    });
    
    return removeTransform;
  }, [editor]);

  return null;
} 