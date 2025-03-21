"use client";

import { useCallback, useEffect, useState, useRef, ReactNode } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ESCAPE_COMMAND,
  createCommand,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  // HeadingTagType,
} from "@lexical/rich-text";
import { $wrapNodes } from "@lexical/selection";
import { $createParagraphNode } from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";

// 创建自定义的斜杠命令
export const KEY_SLASH_COMMAND = createCommand('KEY_SLASH_COMMAND');

type CommandMenuOption = {
  key: string;
  name: string;
  icon: string;
  description: string;
  shortcut?: string;
  action: () => void;
};

export function CommandMenuPlugin(): ReactNode | null {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 重置命令菜单状态
  const resetMenu = useCallback(() => {
    setIsOpen(false);
    setSearchText("");
    setSelectedIndex(0);
  }, []);

  // 处理菜单选项的点击
  const executeAction = useCallback((action: () => void) => {
    action();
    resetMenu();
  }, [resetMenu]);

  // 创建可用的命令选项
  const createCommandOptions = useCallback((): CommandMenuOption[] => {
    return [
      {
        key: "heading1",
        name: "标题1",
        icon: "H1",
        description: "大标题",
        shortcut: "#",
        action: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $wrapNodes(selection, () => $createHeadingNode("h1"));
            }
          });
        },
      },
      {
        key: "heading2",
        name: "标题2",
        icon: "H2",
        description: "中标题",
        shortcut: "##",
        action: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $wrapNodes(selection, () => $createHeadingNode("h2"));
            }
          });
        },
      },
      {
        key: "heading3",
        name: "标题3",
        icon: "H3",
        description: "小标题",
        shortcut: "###",
        action: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $wrapNodes(selection, () => $createHeadingNode("h3"));
            }
          });
        },
      },
      {
        key: "paragraph",
        name: "段落",
        icon: "P",
        description: "普通文本",
        action: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $wrapNodes(selection, () => $createParagraphNode());
            }
          });
        },
      },
      {
        key: "bullet-list",
        name: "无序列表",
        icon: "•",
        description: "无序列表",
        shortcut: "-",
        action: () => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        },
      },
      {
        key: "numbered-list",
        name: "有序列表",
        icon: "1.",
        description: "有序列表",
        shortcut: "1.",
        action: () => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        },
      },
      {
        key: "quote",
        name: "引用",
        icon: "❝",
        description: "引用文本",
        shortcut: ">",
        action: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $wrapNodes(selection, () => $createQuoteNode());
            }
          });
        },
      },
    ];
  }, [editor]);

  // 过滤命令选项
  const getFilteredOptions = useCallback(() => {
    const options = createCommandOptions();
    if (!searchText) return options;
    
    return options.filter((option) => 
      option.name.toLowerCase().includes(searchText.toLowerCase()) || 
      option.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [createCommandOptions, searchText]);

  // 注册斜杠命令
  useEffect(() => {
    const onSlashCommand = () => {
      setIsOpen(true);
      return true;
    };

    return editor.registerCommand(
      KEY_SLASH_COMMAND,
      onSlashCommand,
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  // 注册Escape键关闭菜单
  useEffect(() => {
    const onEscapeCommand = () => {
      if (isOpen) {
        resetMenu();
        return true;
      }
      return false;
    };

    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      onEscapeCommand,
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, isOpen, resetMenu]);

  // 处理选择变更
  useEffect(() => {
    const onSelectionChange = () => {
      if (isOpen) {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          resetMenu();
        }
      }
      return false;
    };

    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      onSelectionChange,
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, isOpen, resetMenu]);

  // 当菜单打开时自动聚焦到搜索框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const options = getFilteredOptions();
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < options.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
        break;
      case "Enter":
        e.preventDefault();
        if (options[selectedIndex]) {
          executeAction(options[selectedIndex].action);
        }
        break;
    }
  };

  if (!isOpen) {
    return null;
  }

  const filteredOptions = getFilteredOptions();

  return (
    <div
      className="command-menu-container"
      ref={menuRef}
      style={{
        position: "absolute",
        zIndex: 10,
        top: "100%",
        left: "0",
        width: "300px",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <div className="command-menu-search" style={{ padding: "0.5rem" }}>
        <input
          ref={inputRef}
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="搜索命令..."
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #e2e8f0",
            borderRadius: "0.25rem",
            outline: "none",
          }}
        />
      </div>
      <div 
        className="command-menu-options"
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            <div
              key={option.key}
              className={`command-menu-option ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => executeAction(option.action)}
              style={{
                padding: "0.5rem 1rem",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: index === selectedIndex ? "#f1f5f9" : "transparent",
              }}
            >
              <div 
                className="command-option-icon"
                style={{
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "0.5rem",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                }}
              >
                {option.icon}
              </div>
              <div className="command-option-content" style={{ flex: 1 }}>
                <div style={{ fontWeight: "500" }}>{option.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {option.description}
                </div>
              </div>
              {option.shortcut && (
                <div
                  className="command-option-shortcut"
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    marginLeft: "0.5rem",
                  }}
                >
                  {option.shortcut}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: "0.75rem 1rem", color: "#64748b" }}>
            没有找到匹配的命令
          </div>
        )}
      </div>
    </div>
  );
} 