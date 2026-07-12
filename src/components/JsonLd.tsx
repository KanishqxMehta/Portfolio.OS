// Reusable JSON-LD structured data components for SEO
// These inject schema.org structured data into page <head> for rich search results

export function OrganizationJsonLd({ baseUrl }: { baseUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "Portfolio.OS",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/icon`,
        },
        "description": "Free portfolio builder for developers. Create stunning developer portfolios with beautiful themes and instant publishing.",
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "name": "Portfolio.OS",
        "url": baseUrl,
        "description": "Build a stunning developer portfolio in minutes — no code needed.",
        "publisher": { "@id": `${baseUrl}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/#app`,
        "name": "Portfolio.OS",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web-based",
        "description": "Free portfolio making website for developers. Create, customize, and publish your professional portfolio with beautiful themes, drag-and-drop editing, and instant publishing.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "featureList": [
          "Block-based portfolio editor",
          "Multiple premium themes",
          "Drag-and-drop reordering",
          "Instant publishing with custom URLs",
          "Mobile responsive design",
          "SEO-optimized portfolios",
          "Analytics dashboard",
        ],
        "provider": { "@id": `${baseUrl}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd({
  name,
  bio,
  url,
  skills,
  socialLinks,
}: {
  name: string;
  bio?: string;
  url: string;
  skills?: string[];
  socialLinks?: { github?: string; linkedin?: string; twitter?: string; instagram?: string };
}) {
  const sameAs = [
    socialLinks?.github,
    socialLinks?.linkedin,
    socialLinks?.twitter,
    socialLinks?.instagram,
  ].filter(Boolean);

  const data: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "url": url,
  };

  if (bio) data.description = bio;
  if (skills && skills.length > 0) data.knowsAbout = skills;
  if (sameAs.length > 0) data.sameAs = sameAs;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
