import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Kodeva CMS')
    .items([
      S.listItem()
        .title('Landing Page')
        .id('landingPage')
        .child(S.document().schemaType('landingPage').documentId('landingPage')),
      S.divider(),
      S.listItem()
        .title('Artikel Blog')
        .schemaType('post')
        .child(
          S.documentTypeList('post')
            .title('Artikel Blog')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
        ),
      S.listItem()
        .title('Kategori Artikel')
        .schemaType('category')
        .child(S.documentTypeList('category').title('Kategori Artikel')),
      S.divider(),
      S.listItem()
        .title('Leads (dari form landing)')
        .id('leads')
        .child(
          S.documentTypeList('lead')
            .title('Leads')
            .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
        ),
    ]);
