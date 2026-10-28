import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { imageSources } from "./imageSources";

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string };

/** Remount on source changes so a previous picture's loading state cannot leak. */
export function SmartImage(props: Props) {
  return <ImageContent key={props.src} {...props} />;
}

function ImageContent({
  src,
  alt,
  loading = "lazy",
  onLoad,
  onError,
  ...props
}: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [nearby, setNearby] = useState(loading === "eager");
  const [original, setOriginal] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const image = ref.current;
    if (!image || nearby) return;
    // Explicitly observe the scrolling dialog as well as ordinary page images.
    // Native lazy loading alone can remain pending after a dialog/section change.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearby(true);
          observer.disconnect();
        }
      },
      { root: image.closest("dialog"), rootMargin: "500px" },
    );
    observer.observe(image);
    return () => observer.disconnect();
  }, [nearby]);
  return (
    <img
      {...props}
      ref={ref}
      src={original ? src : imageSources[src] || src}
      alt={
        failed
          ? `${alt} — 사진을 불러오지 못했어요. 원본 보기를 이용해 주세요.`
          : alt
      }
      loading={nearby ? "eager" : "lazy"}
      decoding="async"
      onLoad={(event) => {
        setFailed(false);
        onLoad?.(event);
      }}
      onError={(event) => {
        if (!original && imageSources[src]) setOriginal(true);
        else setFailed(true);
        onError?.(event);
      }}
    />
  );
}
