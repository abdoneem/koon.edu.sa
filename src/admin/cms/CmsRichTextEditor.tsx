import "jodit/esm/langs/ar.js"
import { useCallback, useMemo } from "react"
import JoditEditor from "jodit-react"
import { useAdminI18n } from "../adminI18n"

type Props = {
  /** Parent should remount via `key` when loading different HTML from the server. */
  initialHtml: string
  onChange: (html: string) => void
}

/**
 * CMS body HTML — [Jodit](https://xdsoft.net/jodit/) (MIT), familiar WYSIWYG toolbar, good RTL + React 19 support.
 * Styles ship with `jodit-react` (includes `jodit.min.css`); toolbar is trimmed to essentials.
 */
export function CmsRichTextEditor({ initialHtml, onChange }: Props) {
  const { t, isRtl } = useAdminI18n()

  const handleChange = useCallback(
    (html: string) => {
      onChange(html)
    },
    [onChange],
  )

  // Jodit `DeepPartial<Config>` blows TS recursion depth when inferred through JSX; keep a plain object + cast.
  const config = useMemo(
    () => ({
      readonly: false,
      height: 360,
      minHeight: 240,
      direction: isRtl ? "rtl" : "ltr",
      language: isRtl ? "ar" : "en",
      placeholder: t("admin.cmsEditor.richTextPlaceholder"),
      statusbar: false,
      toolbarAdaptive: false,
      toolbarButtonSize: "middle",
      showCharsCounter: false,
      showWordsCounter: false,
      askBeforePasteFromWord: false,
      enableDragAndDropFileToEditor: false,
      askBeforePasteHTML: false,
      buttons: [
        "bold",
        "italic",
        "|",
        "ul",
        "ol",
        "|",
        "paragraph",
        "|",
        "link",
        "|",
        "undo",
        "redo",
        "|",
        "eraser",
      ],
    }) as Record<string, unknown>,
    [isRtl, t],
  )

  const value = initialHtml?.trim() ? initialHtml : "<p></p>"

  return (
    <div className="cms-rich-text cms-rich-text--jodit">
      <JoditEditor
        value={value}
        config={config as never}
        onChange={handleChange}
      />
    </div>
  )
}
