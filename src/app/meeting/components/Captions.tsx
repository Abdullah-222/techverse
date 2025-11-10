"use client";

import { useEffect, useState } from "react";
import type { HMSStore } from "@100mslive/hms-video-store";

interface CaptionsProps {
  hmsStore: HMSStore;
  hmsActions: any; // HMSActions from roomkit-react ref
}

export default function Captions({ hmsStore, hmsActions }: CaptionsProps) {
  const [captions, setCaptions] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to captions from 100ms store
    const unsubscribe = hmsStore.subscribe(
      (state: any) => {
        // Get captions from store
        const captionsData = state?.captions || [];
        setCaptions(captionsData);
      },
      (state: any) => state?.captions
    );

    return () => {
      unsubscribe();
    };
  }, [hmsStore]);

  return (
    <div className="max-h-48 overflow-y-auto">
      {captions.length > 0 ? (
        <div className="space-y-2">
          {captions.map((caption, index) => (
            <p key={index} className="text-sm text-gray-800">
              {caption}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No captions available</p>
      )}
    </div>
  );
}

