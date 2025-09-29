import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  type?: 'website' | 'article';
  image?: string;
  url?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  author = 'PeakOps Team',
  type = 'website',
  image = 'https://getpeakops.com/og-image.jpg',
  url,
  publishedTime,
  modifiedTime,
  section,
  tags
}) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Set or update meta tags
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);
    if (author) setMetaTag('author', author);

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:site_name', 'PeakOps', true);
    
    if (url) setMetaTag('og:url', url, true);
    
    // Article-specific Open Graph tags
    if (type === 'article') {
      if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
      if (author) setMetaTag('article:author', author, true);
      if (section) setMetaTag('article:section', section, true);
      if (tags) {
        tags.forEach(tag => {
          const meta = document.createElement('meta');
          meta.setAttribute('property', 'article:tag');
          meta.setAttribute('content', tag);
          document.head.appendChild(meta);
        });
      }
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);

    // Additional SEO tags
    setMetaTag('robots', 'index, follow');
    setMetaTag('googlebot', 'index, follow');
    
    // Canonical URL if provided
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = url;
    }

    // JSON-LD structured data for articles
    if (type === 'article') {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "author": {
          "@type": "Organization",
          "name": author
        },
        "publisher": {
          "@type": "Organization",
          "name": "PeakOps",
          "logo": {
            "@type": "ImageObject",
            "url": "https://getpeakops.com/logo.jpg"
          }
        },
        "image": image,
        ...(publishedTime && { "datePublished": publishedTime }),
        ...(modifiedTime && { "dateModified": modifiedTime }),
        ...(url && { "url": url }),
        ...(section && { "articleSection": section }),
        ...(tags && { "keywords": tags.join(', ') })
      };

      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }

  }, [title, description, keywords, author, type, image, url, publishedTime, modifiedTime, section, tags]);

  return null;
};

export default SEO;