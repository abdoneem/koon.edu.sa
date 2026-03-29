interface FigureImageProps {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
  className?: string
  /** Above-the-fold hero: eager load + fetch priority */
  priority?: boolean
}

export function FigureImage({
  src,
  alt,
  caption,
  width = 960,
  height = 640,
  className = "",
  priority = false,
}: FigureImageProps) {
  return (
    <figure className={`media-placeholder ${className}`.trim()}>
      <div className="media-placeholder__frame">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          className="media-placeholder__img"
        />
      </div>
      {caption ? <figcaption className="media-placeholder__cap">{caption}</figcaption> : null}
    </figure>
  )
}
