import { Suspense } from "react";
import Feed from "@/components/Feed";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const query = typeof params.q === 'string' ? params.q : undefined;

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Feed initialPage={page} initialQuery={query} />
      </Suspense>
    </main>
  );
}
