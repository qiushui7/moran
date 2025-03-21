import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot as getLexicalRoot, LexicalEditor } from "lexical";

// 将HTML转换为编辑器内容
export async function importHTML(editor: LexicalEditor, html: string): Promise<void> {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, "text/html");

  // 清除编辑器内容
  editor.update(() => {
    const nodes = $generateNodesFromDOM(editor, dom);
    // 替换根节点内容
    const root = getLexicalRoot();
    root.clear();
    nodes.forEach((node) => root.append(node));
  });
}

// 将编辑器内容转换为HTML
export async function exportToHTML(editor: LexicalEditor): Promise<string> {
  let html = "";
  
  await editor.update(() => {
    html = $generateHtmlFromNodes(editor);
  });
  
  return html;
}

// 将HTML转换为Markdown (简单实现)
export function htmlToMarkdown(html: string): string {
  if (!html) return "";
  
  // 简单的HTML到Markdown转换
  const markdown = html
    // 处理标题
    .replace(/<h1>(.*?)<\/h1>/g, "# $1\n\n")
    .replace(/<h2>(.*?)<\/h2>/g, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/g, "### $1\n\n")
    // 处理段落
    .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
    // 处理加粗
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    // 处理斜体
    .replace(/<em>(.*?)<\/em>/g, "*$1*")
    // 处理列表
    .replace(/<ul>([^]*?)<\/ul>/g, (match, p1) => {
      return p1.replace(/<li>(.*?)<\/li>/g, "- $1\n");
    })
    .replace(/<ol>([^]*?)<\/ol>/g, (match, p1) => {
      let index = 1;
      return p1.replace(/<li>(.*?)<\/li>/g, () => {
        return `${index++}. $1\n`;
      });
    })
    // 处理链接
    .replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)")
    // 处理引用
    .replace(/<blockquote>([^]*?)<\/blockquote>/g, "> $1\n\n")
    // 处理代码
    .replace(/<code>(.*?)<\/code>/g, "`$1`")
    .replace(/<pre><code>([^]*?)<\/code><\/pre>/g, "```\n$1\n```\n\n")
    // 移除剩余标签
    .replace(/<[^>]*>?/gm, "")
    // 处理HTML实体
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
  
  return markdown.trim();
}

// 将Markdown转换为HTML (简单实现)
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  // 简单的Markdown到HTML转换
  const html = markdown
    // 处理标题
    .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
    // 处理加粗
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // 处理斜体
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // 处理无序列表
    .replace(/^- (.*?)$/gm, "<li>$1</li>")
    .replace(/(<li>.*?<\/li>\n)+/g, "<ul>$&</ul>")
    // 处理有序列表
    .replace(/^\d+\. (.*?)$/gm, "<li>$1</li>")
    .replace(/(<li>.*?<\/li>\n)+/g, "<ol>$&</ol>")
    // 处理链接
    .replace(/\[(.*?)\]\((.*?)\)/g, "<a href=\"$2\">$1</a>")
    // 处理引用
    .replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>")
    // 处理代码
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/```([^]*)```/g, "<pre><code>$1</code></pre>")
    // 处理段落
    .replace(/^([^<].*?)$/gm, "<p>$1</p>");
  
  return html;
}

// 获取Lexical编辑器根节点
// function $getRoot() {
//   return $getRoot();
// } 