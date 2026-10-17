import { defineField, defineType } from 'sanity';

export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  description:
    'Lead dari form landing page. Dokumen dibuat otomatis oleh sistem dan bersifat hanya-baca.',
  fields: [
    defineField({ name: 'name', title: 'Nama', type: 'string', readOnly: true }),
    defineField({
      name: 'contactType',
      title: 'Jenis kontak',
      type: 'string',
      readOnly: true,
      options: { list: ['email', 'whatsapp'] },
    }),
    defineField({ name: 'contactValue', title: 'Kontak', type: 'string', readOnly: true }),
    defineField({ name: 'source', title: 'Sumber halaman', type: 'string', readOnly: true }),
    defineField({ name: 'utmSource', title: 'UTM Source', type: 'string', readOnly: true }),
    defineField({ name: 'utmMedium', title: 'UTM Medium', type: 'string', readOnly: true }),
    defineField({ name: 'utmCampaign', title: 'UTM Campaign', type: 'string', readOnly: true }),
    defineField({ name: 'utmContent', title: 'UTM Content', type: 'string', readOnly: true }),
    defineField({ name: 'utmTerm', title: 'UTM Term', type: 'string', readOnly: true }),
    defineField({ name: 'referrer', title: 'Referrer', type: 'string', readOnly: true }),
    defineField({ name: 'landingPath', title: 'Halaman pendaratan', type: 'string', readOnly: true }),
    defineField({ name: 'createdAt', title: 'Waktu masuk', type: 'datetime', readOnly: true }),
  ],
  orderings: [
    {
      title: 'Terbaru',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'contactValue', description: 'createdAt' },
    prepare: ({ title, subtitle, description }) => ({
      title: title ?? '(tanpa nama)',
      subtitle,
      description: description ? new Date(description).toLocaleString('id-ID') : undefined,
    }),
  },
});
