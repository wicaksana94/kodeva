import Image from 'next/image';
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from '@portabletext/react';
import { sanityImageSrc } from '@/lib/sanity/image';
import type { SanityImage } from '@/sanity/types';

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mt-4 leading-relaxed text-slate-700">{children}</p>,
    h2: ({ children }) => (
      <h2 className="mt-9 text-2xl font-extrabold tracking-tight text-slate-900">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 text-xl font-bold tracking-tight text-slate-900">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-5 border-l-4 border-indigo-300 bg-indigo-50/60 py-2 pl-4 text-slate-700 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1.5 pl-6 text-slate-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-slate-700">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href = typeof value?.href === 'string' ? value.href : '#';
      const external = href.startsWith('http');
      return (
        <a
          href={href}
          className="font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: { value: SanityImage }) => {
      const src = sanityImageSrc(value);
      if (!src) return null;
      return (
        <figure className="mt-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200">
            <Image
              src={src}
              alt={value.alt || ''}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          {value.alt && (
            <figcaption className="mt-2 text-center text-xs text-slate-500">{value.alt}</figcaption>
          )}
        </figure>
      );
    },
  },
};

export function PostBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="max-w-none">
      <PortableText value={value} components={components} />
    </div>
  );
}
