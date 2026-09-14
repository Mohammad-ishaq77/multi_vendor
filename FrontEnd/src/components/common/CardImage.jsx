import { useEffect, useState } from "react";
import { categoryFallback } from "../../utils/images";

const CardImage = ({ src, alt = "", className = "", category, onLoad }) => {
  const [url, setUrl] = useState(src);

  useEffect(() => {
    setUrl(src);
  }, [src]);

  if (!url) {
    return <div className={`bg-[var(--color-green-bg)] ${className}`} aria-hidden="true" />;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onLoad={onLoad}
      onError={() => {
        const fallback = categoryFallback(category);
        if (url && url !== fallback) setUrl(fallback);
        else setUrl("");
      }}
    />
  );
};

export default CardImage;
