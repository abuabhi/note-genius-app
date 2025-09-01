"use client";

import React from "react";
import AutoScroll from "embla-carousel-auto-scroll";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface Logo {
  id: string;
  description: string;
  image: string;
  className?: string;
}

interface Logos3Props {
  heading?: string;
  logos?: Logo[];
  className?: string;
  count?: number; // number of sequential logos to attempt
}

// Small helper to gracefully fall back between svg -> png -> jpg
const ImageWithFallback: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const tried = React.useRef<Record<string, boolean>>({});

  const onLoad = () => {
    try {
      console.info("[Logos3] image loaded", { src: currentSrc, alt });
    } catch {}
  };

  const onError = () => {
    // Try switching extensions in order: svg -> png -> jpg
    try {
      const url = new URL(currentSrc, window.location.origin);
      const ext = url.pathname.split(".").pop()?.toLowerCase();
      if (ext === "svg" && !tried.current["png"]) {
        tried.current["png"] = true;
        const next = currentSrc.replace(/\.svg(\?.*)?$/, ".png$1");
        console.warn("[Logos3] svg failed, trying png", { from: currentSrc, to: next, alt });
        setCurrentSrc(next);
      } else if (ext === "png" && !tried.current["jpg"]) {
        tried.current["jpg"] = true;
        const next = currentSrc.replace(/\.png(\?.*)?$/, ".jpg$1");
        console.warn("[Logos3] png failed, trying jpg", { from: currentSrc, to: next, alt });
        setCurrentSrc(next);
      } else {
        console.error("[Logos3] all fallbacks failed, hiding image", { src: currentSrc, alt });
        setCurrentSrc(
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
        );
      }
    } catch (e) {
      console.error("[Logos3] error parsing URL, hiding image", { src: currentSrc, alt, error: e });
      setCurrentSrc(
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
      );
    }
  };

  return <img src={currentSrc} alt={alt} className={className} onLoad={onLoad} onError={onError} loading="lazy" />;
};

const Logos3: React.FC<Logos3Props> = ({
  heading = "Trusted by students at",
  logos,
  className,
  count = 12,
}) => {
  // Default to sequential school logos placed under public/lovable-uploads/schools/
  // Example filenames: 1.svg, 2.svg, 3.svg ...
  const defaultLogos: Logo[] = Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    return {
      id: `logo-${num}`,
      description: `School logo ${num}`,
      image: `/lovable-uploads/schools/${num}.svg?v=1`,
      className: "h-12 w-auto sm:h-16 md:h-20",
    };
  });

  const data = logos && logos.length > 0 ? logos : defaultLogos;

  return (
    <section className={"py-8 sm:py-12 " + (className ?? "")}>
      <div className="container mx-auto flex flex-col items-center text-center px-4 sm:px-6">
        
        <h3 className="mb-4 sm:mb-6 text-lg sm:text-2xl font-bold tracking-tight lg:text-3xl">{heading}</h3>
      </div>
      <div className="pt-4 sm:pt-6 md:pt-8">
        <div className="relative mx-auto flex items-center justify-center lg:max-w-5xl">
          <Carousel opts={{ loop: true }} plugins={[AutoScroll({ playOnInit: true, speed: 1 }) as any]}>
            <CarouselContent className="ml-0">
              {data.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="flex basis-1/2 justify-center pl-0 xs:basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="mx-4 sm:mx-6 lg:mx-8 flex shrink-0 items-center justify-center">
                    <div className="px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                      <ImageWithFallback src={logo.image} alt={logo.description} className={[logo.className, "object-contain"].filter(Boolean).join(" ")} />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
