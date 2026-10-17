import { defineField, defineType } from 'sanity';
import { products } from '@/lib/catalog/data';

const productOptions = products.map((product) => ({
  title: `${product.name} (${product.categoryId})`,
  value: product.id,
}));

export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'featured', title: 'Produk Unggulan' },
    { name: 'testimonials', title: 'Testimoni' },
    { name: 'faq', title: 'FAQ' },
    { name: 'lead', title: 'Form Lead' },
    { name: 'promo', title: 'Promo' },
  ],
  fields: [
    defineField({
      name: 'campaignName',
      title: 'Nama campaign',
      type: 'string',
      group: 'promo',
      description: 'Dipakai sebagai label campaign di event tracking (contoh: Promo Akhir Tahun).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'promoLabel',
      title: 'Label promo di hero',
      type: 'string',
      group: 'promo',
    }),
    defineField({
      name: 'promoNote',
      title: 'Catatan promo',
      type: 'string',
      group: 'promo',
    }),

    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow (teks kecil di atas judul)',
          type: 'string',
        }),
        defineField({
          name: 'title',
          title: 'Judul',
          type: 'string',
          validation: (rule) => rule.required().max(90),
        }),
        defineField({
          name: 'subtitle',
          title: 'Subjudul',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required().max(220),
        }),
        defineField({
          name: 'image',
          title: 'Gambar hero',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Teks alternatif (aksesibilitas)', type: 'string' }),
          ],
        }),
        defineField({ name: 'ctaPrimaryLabel', title: 'Label tombol utama', type: 'string' }),
        defineField({ name: 'ctaPrimaryHref', title: 'Link tombol utama', type: 'string' }),
        defineField({ name: 'ctaSecondaryLabel', title: 'Label tombol sekunder', type: 'string' }),
        defineField({ name: 'ctaSecondaryHref', title: 'Link tombol sekunder', type: 'string' }),
      ],
    }),

    defineField({
      name: 'featuredHeading',
      title: 'Judul section produk unggulan',
      type: 'string',
      group: 'featured',
    }),
    defineField({
      name: 'featuredSubheading',
      title: 'Subjudul section produk unggulan',
      type: 'string',
      group: 'featured',
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Produk yang ditampilkan',
      type: 'array',
      group: 'featured',
      of: [{ type: 'string' }],
      options: { list: productOptions },
      description: 'Pilih produk (dari katalog marketplace) yang tampil di landing page.',
    }),

    defineField({
      name: 'testimonialsHeading',
      title: 'Judul section testimoni',
      type: 'string',
      group: 'testimonials',
    }),
    defineField({
      name: 'testimonialsSubheading',
      title: 'Subjudul section testimoni',
      type: 'string',
      group: 'testimonials',
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimoni',
      type: 'array',
      group: 'testimonials',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Nama',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'role', title: 'Jabatan / usaha', type: 'string' }),
            defineField({
              name: 'quote',
              title: 'Isi testimoni',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'name', subtitle: 'role' } },
        },
      ],
    }),

    defineField({ name: 'faqHeading', title: 'Judul section FAQ', type: 'string', group: 'faq' }),
    defineField({
      name: 'faqSubheading',
      title: 'Subjudul section FAQ',
      type: 'string',
      group: 'faq',
    }),
    defineField({
      name: 'faqItems',
      title: 'Pertanyaan & jawaban',
      type: 'array',
      group: 'faq',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Pertanyaan',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Jawaban',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'question' } },
        },
      ],
    }),

    defineField({ name: 'leadHeading', title: 'Judul form lead', type: 'string', group: 'lead' }),
    defineField({
      name: 'leadSubheading',
      title: 'Subjudul form lead',
      type: 'text',
      rows: 2,
      group: 'lead',
    }),
    defineField({
      name: 'leadBullets',
      title: 'Poin keunggulan di samping form',
      type: 'array',
      group: 'lead',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Landing Page', subtitle: 'Konten halaman campaign & blog Kodeva' }),
  },
});
