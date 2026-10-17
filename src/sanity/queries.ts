export const landingPageQuery = /* groq */ `
*[_type == "landingPage" && _id == "landingPage"][0]{
  campaignName,
  hero,
  featuredHeading,
  featuredSubheading,
  "featuredProductIds": featuredProducts,
  featuredCtaLabel,
  testimonialsHeading,
  testimonialsSubheading,
  testimonials,
  faqHeading,
  faqSubheading,
  faqItems,
  leadHeading,
  leadSubheading,
  leadBullets,
  promoLabel,
  promoNote
}`;

export const postSummaryFields = /* groq */ `
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  cover,
  publishedAt,
  "category": category->{ name, "slug": slug.current }
`;

export const postsCountQuery = /* groq */ `
count(*[_type == "post" && defined(slug.current)])
`;

export const postsPageQuery = /* groq */ `
*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [$start...$end] {
  ${postSummaryFields}
}`;

export const postBySlugQuery = /* groq */ `
*[_type == "post" && slug.current == $slug][0]{
  ${postSummaryFields},
  body,
  "relatedProductIds": relatedProducts
}`;

export const postSlugsQuery = /* groq */ `
*[_type == "post" && defined(slug.current)].slug.current
`;
