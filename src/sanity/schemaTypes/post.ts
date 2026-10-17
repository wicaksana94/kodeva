import { defineField, defineType } from 'sanity';
import { products } from '@/lib/catalog/data';

const productOptions = products.map((product) => ({
  title: `${product.name} (${product.categoryId})`,
  value: product.id,
}));

export const post = defineType({
  name: 'post',
  title: 'Artikel Blog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Judul',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Ringkasan',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(240),
      description:
        'Muncul di daftar artikel dan pratinjau saat dibagikan di WhatsApp/sosial media.',
    }),
    defineField({
      name: 'cover',
      title: 'Gambar cover',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Teks alternatif (aksesibilitas)', type: 'string' }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Tanggal terbit',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Isi artikel',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Kutipan', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Tautan',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (rule) => rule.required(),
                  }),
                ],
              },
            ],
          },
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Produk terkait',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: productOptions },
      description:
        'Artikel menautkan produk marketplace; tampil sebagai kartu produk di bawah artikel.',
    }),
  ],
  orderings: [
    {
      title: 'Terbaru',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'cover' },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? new Date(subtitle).toLocaleDateString('id-ID') : 'Draft',
      media,
    }),
  },
});
