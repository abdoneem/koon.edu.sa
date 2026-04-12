import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"

type Props = {
  /** Markdown source (GFM). Raw HTML is not trusted; sanitized pipeline only. */
  markdown: string
  className?: string
}

/**
 * Renders CMS-authored markdown for public detail pages.
 * Uses GFM (tables, lists, links) and rehype-sanitize so output stays safe.
 */
export function MarkdownBody({ markdown, className }: Props) {
  const trimmed = markdown.trim()
  if (!trimmed) {
    return null
  }

  return (
    <div className={["site-markdown", className].filter(Boolean).join(" ")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {trimmed}
      </ReactMarkdown>
    </div>
  )
}
