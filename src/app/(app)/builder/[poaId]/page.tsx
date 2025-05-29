
"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function POABuilderPage() {
  const router = useRouter();
  const params = useParams();
  const poaId = params.poaId as string;

  useEffect(() => {
    // Default to 'header' section if opening a POA directly
    if (poaId && !poaId.includes('/')) { // Ensure it's just the ID, not a full path
      router.replace(`/builder/${poaId}/header`);
    }
  }, [poaId, router]);

  return null; 
}

