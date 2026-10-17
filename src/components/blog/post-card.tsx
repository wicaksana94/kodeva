import Image from 'next/image';
import Link from 'next/link';
import type { PostSummary } from '@/sanity/types';
import { formatPostDate } from '@/lib/blog';
import { sanityImageLoader, sanityImageSrc } from '@/lib/sanity/image';

export function PostCard({ post }: { post: PostSummary }) {
  const coverSrc = sanityImageSrc(post.cover);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-slate-100 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600">
          {coverSrc ? (
            <Image
              src={coverSrc}
              loader={sanityImageLoader}
              alt={post.cover?.alt || post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <span className="text-4xl font-black tracking-tight text-white/90">
                {post.category?.name ?? 'Kodeva'}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-xs">
            {post.category && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-semibold text-indigo-700 ring-1 ring-indigo-200">
                {post.category.name}
              </span>
            )}
            <time className="text-slate-500" dateTime={post.publishedAt ?? undefined}>
              {formatPostDate(post.publishedAt)}
            </time>
          </div>
          <h2 className="mt-2 text-lg leading-snug font-bold text-slate-900 group-hover:text-indigo-700">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>
          <span className="mt-auto pt-4 text-sm font-semibold text-indigo-700">
            Baca selengkapnya →
          </span>
        </div>
      </Link>
    </article>
  );
}
