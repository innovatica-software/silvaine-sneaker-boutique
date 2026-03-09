import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://silvaine-sneaker-boutique.lovable.app';
const DEFAULT_IMAGE = 'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3112afd7-c2d6-4252-9402-befad75ffff1/id-preview-aa3bb314--0a7cbb3d-44af-43db-a97a-66a1d5d69a81.lovable.app-1773006636563.png';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SEO = ({
  title = 'Silvaine — Premium Italian Sneakers | Milano',
  description = 'Silvaine crafts luxury sneakers from the finest Italian leather. Handmade in Milano, designed for those who appreciate the finer things.',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  jsonLd,
}: SEOProps) => {
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Silvaine" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
