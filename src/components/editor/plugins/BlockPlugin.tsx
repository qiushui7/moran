"use client";

import { useEffect, ReactNode } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_ENTER_COMMAND,
  NodeKey,
} from "lexical";
import { mergeRegister } from "@lexical/utils";

export function BlockPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // 处理回车键，创建新块
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        () => {
          const selection = $getSelection();
          
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return false;
          }
          
          // 当在段落末尾按下回车，创建新的段落块
          const anchorNode = selection.anchor.getNode();
          if (
            anchorNode.getTextContent().length === selection.anchor.offset &&
            anchorNode.getNextSibling() === null
          ) {
            editor.update(() => {
              const root = $getRoot();
              const paragraph = $createParagraphNode();
              root.append(paragraph);
              paragraph.select();
            });
            return true;
          }
          
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
}

// 自定义块组件
export function BlockWrapper({
  nodeKey,
  children,
}: {
  nodeKey: NodeKey;
  children: ReactNode;
}): ReactNode {
  return (
    <div 
      className="notion-block" 
      data-block-id={nodeKey}
      style={{
        position: "relative",
        marginBottom: "0.5rem",
        paddingLeft: "1.5rem",
        borderLeft: "2px solid transparent",
        transition: "border-color 0.2s ease",
      }}
    >
      <div 
        className="block-controls"
        style={{
          position: "absolute",
          left: "0",
          top: "0.25rem",
          width: "1rem",
          opacity: "0",
          transition: "opacity 0.2s ease",
        }}
      >
        <span className="block-grip" style={{ cursor: "grab", fontSize: "0.8rem" }}>
          ⋮⋮
        </span>
      </div>
      {children}
    </div>
  );
}

// 添加块样式到CSS
const blockStyles = `
  .notion-block:hover {
    border-left-color: #e2e8f0;
  }
  
  .notion-block:hover .block-controls {
    opacity: 0.5;
  }
  
  .notion-block .block-controls:hover {
    opacity: 1;
  }
`;

// 添加样式到文档
export function injectBlockStyles() {
  const styleTag = document.createElement("style");
  styleTag.textContent = blockStyles;
  document.head.appendChild(styleTag);
  
  return () => {
    document.head.removeChild(styleTag);
  };
} 