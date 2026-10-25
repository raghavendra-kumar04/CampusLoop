import { useEffect } from 'react';

const SITE_URL = 'https://campusloop-nine.vercel.app';
const DEFAULT_TITLE = 'CampusLoop | Student Marketplace for College Communities';
const DEFAULT_DESC =
  'CampusLoop is an exclusive peer-to-peer campus marketplace for verified college students. Buy, sell, and exchange textbooks, electronics, and dorm essentials safely.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export default function SEO({
  title,
  description = DEFAULT_DESC,
  canonical,
  type = 'website',
  image = DEFAULT_IMAGE,
  noindex = false,
  schema = null,
}) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title
      ? title.includes('CampusLoop')
        ? title
        : `${title} | CampusLoop`
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // Helper function to create or update meta tags
    const setMetaTag = (attribute, attrValue, content) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // 3. Canonical Link
    const fullCanonical = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${SITE_URL}${canonical}`
      : `${SITE_URL}/`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullCanonical);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullCanonical);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:image', image);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // 6. Dynamic Page Structured Data (JSON-LD)
    const scriptId = 'dynamic-page-schema';
    let scriptTag = document.getElementById(scriptId);

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, canonical, type, image, noindex, schema]);

  return null;
}
