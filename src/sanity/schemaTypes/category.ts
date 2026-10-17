import { defineField, defineType } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Kategori Artikel',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nama kategori',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 48 },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'name' },
  },
});
