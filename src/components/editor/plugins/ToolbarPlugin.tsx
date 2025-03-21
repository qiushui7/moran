"use client";

import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL
} from "lexical";
import { $wrapNodes, $isAtNodeEnd } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode
} from "@lexical/list";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isCodeNode, $createCodeNode, CODE_LANGUAGE_MAP, CODE_LANGUAGE_FRIENDLY_NAME_MAP } from "@lexical/code";
import { $isTableNode } from "@lexical/table";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Redo,
  Strikethrough,
  Type,
  Underline,
  Undo,
  Quote
} from "lucide-react";

// 工具栏按钮组件
function ToolbarButton({
  active = false,
  disabled = false,
  children,
  icon,
  title,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`px-2 py-1 rounded-md transition-colors ${
        active 
          ? "bg-primary/10 text-primary border border-primary/20" 
          : "hover:bg-secondary border border-transparent hover:border-border"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={title}
      title={title}
      type="button"
    >
      {icon || children}
    </button>
  );
}

// 工具栏分割线组件
function Divider() {
  return <div className="h-6 w-px bg-border mx-1" />;
}

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<string>("15px");
  const [fontColor, setFontColor] = useState<string>("#000");
  const [bgColor, setBgColor] = useState<string>("#fff");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [elementFormat, setElementFormat] = useState<string>("left");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // 获取文本格式
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL((selection as any).isDirectionRTL ? (selection as any).isDirectionRTL() : false);

      // 检查是否为链接
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      // 获取块类型和元素格式
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      setSelectedElementKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type === "quote") {
            setBlockType("quote");
          } else if (type === "code") {
            setBlockType("code");
          } else {
            setBlockType(type);
          }

          // 设置元素格式（对齐方式）
          const formatType = (element as any).getFormatType ? (element as any).getFormatType() : null;
          setElementFormat(formatType ? formatType.toString() : "left");
        }
      }
    }
  }, [activeEditor]);

  // 获取选中节点
  const getSelectedNode = (selection: any) => {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
      return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
      return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
      return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
  };

  const $isRootOrShadowRoot = (node: any) => {
    return node.getKey() === "root";
  };

  // 监听命令和选择变化
  useEffect(() => {
    // 监听 SELECTION_CHANGE_COMMAND
    const removeSelectionListener = activeEditor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }
    );

    // 监听撤销/重做状态
    const removeUndoListener = activeEditor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    const removeRedoListener = activeEditor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    return () => {
      removeSelectionListener();
      removeUndoListener();
      removeRedoListener();
    };
  }, [activeEditor, updateToolbar]);

  // 格式化处理函数
  const formatParagraph = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createParagraphNode());
      }
    });
  }, [activeEditor]);

  const formatHeading = useCallback(
    (headingType: HeadingTagType) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode(headingType));
        }
      });
    },
    [activeEditor]
  );

  const formatQuote = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode());
      }
    });
  }, [activeEditor]);

  const formatCode = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createCodeNode());
      }
    });
  }, [activeEditor]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, {
        url: "https://",
        target: "_blank"
      });
    } else {
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink]);

  const insertImage = useCallback(() => {
    // 示例实现 - 实际项目中需要完善图片上传功能
    const url = prompt("输入图片URL", "https://example.com/image.jpg");
    if (url) {
      // 你需要在项目中实现插入图片的功能
      alert("图片插入功能需要额外实现插件支持");
    }
  }, []);

  const blockTypeToBlockName = {
    paragraph: "正文",
    h1: "标题 1",
    h2: "标题 2",
    h3: "标题 3",
    h4: "标题 4",
    h5: "标题 5",
    h6: "标题 6",
    ul: "无序列表",
    ol: "有序列表",
    quote: "引用",
    code: "代码块"
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 p-2 border-b border-border bg-card">
      <div className="flex items-center">
        <div className="flex items-center mr-2">
          <button
            className="p-1 hover:bg-secondary rounded"
            onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
            disabled={!canUndo}
            title="撤销"
            aria-label="撤销"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            className="p-1 hover:bg-secondary rounded"
            onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
            disabled={!canRedo}
            title="重做"
            aria-label="重做"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <Divider />

        <select
          className="h-8 px-2 rounded border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={blockType}
          onChange={(e) => {
            const newBlockType = e.target.value;
            
            switch (newBlockType) {
              case "h1":
                formatHeading("h1");
                break;
              case "h2":
                formatHeading("h2");
                break;
              case "h3":
                formatHeading("h3");
                break;
              case "h4":
                formatHeading("h4");
                break;
              case "h5":
                formatHeading("h5");
                break;
              case "h6":
                formatHeading("h6");
                break;
              case "paragraph":
                formatParagraph();
                break;
              case "quote":
                formatQuote();
                break;
              case "ul":
                activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                break;
              case "ol":
                activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                break;
              case "code":
                formatCode();
                break;
            }
          }}
        >
          {Object.entries(blockTypeToBlockName).map(([type, name]) => (
            <option key={type} value={type}>
              {name}
            </option>
          ))}
        </select>

        <Divider />

        <div className="flex items-center">
          <ToolbarButton
            active={isBold}
            title="加粗"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            icon={<Bold className="h-4 w-4" />}
          />
          <ToolbarButton
            active={isItalic}
            title="斜体"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            icon={<Italic className="h-4 w-4" />}
          />
          <ToolbarButton
            active={isUnderline}
            title="下划线"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            icon={<Underline className="h-4 w-4" />}
          />
          <ToolbarButton
            active={isStrikethrough}
            title="删除线"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            }}
            icon={<Strikethrough className="h-4 w-4" />}
          />
          <ToolbarButton
            active={isCode}
            title="内联代码"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            }}
            icon={<Code className="h-4 w-4" />}
          />
        </div>

        <Divider />

        <div className="flex items-center">
          <ToolbarButton
            active={elementFormat === "left"}
            title="左对齐"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
            }}
            icon={<AlignLeft className="h-4 w-4" />}
          />
          <ToolbarButton
            active={elementFormat === "center"}
            title="居中对齐"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
            }}
            icon={<AlignCenter className="h-4 w-4" />}
          />
          <ToolbarButton
            active={elementFormat === "right"}
            title="右对齐"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
            }}
            icon={<AlignRight className="h-4 w-4" />}
          />
          <ToolbarButton
            active={elementFormat === "justify"}
            title="两端对齐"
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
            }}
            icon={<AlignJustify className="h-4 w-4" />}
          />
        </div>

        <Divider />

        <div className="flex items-center">
          <ToolbarButton
            active={isLink}
            title="插入链接"
            onClick={insertLink}
            icon={<Link className="h-4 w-4" />}
          />
          <ToolbarButton
            title="插入图片"
            onClick={insertImage}
            icon={<Image className="h-4 w-4" />}
          />
          <ToolbarButton
            title="插入分割线"
            onClick={() => {
              // 实现分割线插入
              alert("分割线功能需要额外实现插件支持");
            }}
            icon={<Minus className="h-4 w-4" />}
          />
        </div>
      </div>

    </div>
  );
} 