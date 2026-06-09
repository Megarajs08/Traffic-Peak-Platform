import { useEffect } from "react";

interface SEOMetaProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  noIndex?: boolean;
  keywords?: string;
}

const SITE_NAME = "TrafficPeak";
const BASE_URL = "https://trafficpeak.replit.app";

function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function SEOMeta({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  structuredData,
  noIndex = false,
  keywords,
}: SEOMetaProps) {
  const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;

  useEffect(() => {
    document.title = fullTitle;

    setMetaTag("og:title", fullTitle, true);
    setMetaTag("twitter:title", fullTitle);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:site_name", SITE_NAME, true);
    setMetaTag("robots", noIndex ? "noindex, nofollow" : "index, follow");

    if (description) {
      setMetaTag("description", description);
      setMetaTag("og:description", description, true);
      setMetaTag("twitter:description", description);
    }

    if (keywords) {
      setMetaTag("keywords", keywords);
    }

    const ogImg = ogImage || `${BASE_URL}/og-default.png`;
    setMetaTag("og:image", ogImg, true);
    setMetaTag("twitter:image", ogImg);
    setMetaTag("twitter:card", "summary_large_image");

    const canonicalHref = canonical || (BASE_URL + window.location.pathname);
    setLink("canonical", canonicalHref);
    setMetaTag("og:url", canonicalHref, true);

    const existingScript = document.querySelector("script[data-seo-json]");
    if (existingScript) existingScript.remove();

    if (structuredData) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-json", "true");
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      document.querySelector("script[data-seo-json]")?.remove();
    };
  }, [fullTitle, description, canonical, ogImage, ogType, structuredData, noIndex, keywords]);

  return null;
}
