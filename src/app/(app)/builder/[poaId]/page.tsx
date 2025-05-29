"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function POABuilderPage() {
  const router = useRouter();
  const params = useParams();
  const poaId = params.poaId as string;

  useEffect(() => {
    if (poaId) {
      router.replace(`/builder/${poaId}/header`);
    }
  }, [poaId, router]);

  return null; // Or a loading state
}
