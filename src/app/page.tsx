import { Suspense } from "react";
import Feed from "@/components/Feed";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const query = typeof params.q === 'string' ? params.q : undefined;

  console.log('🏠 Page component rendered with:', { page, query, params });

  // Create a unique key to force Feed re-render when URL changes
  const feedKey = `${query || 'home'}-${page}`;

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Feed key={feedKey} initialPage={page} initialQuery={query} />
      </Suspense>
    </main>
  );
}
