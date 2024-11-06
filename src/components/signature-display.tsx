"use client";

import Image from "next/image";

interface SignatureDisplayProps {
  signature: string;
  width?: number;
  height?: number;
}

export function SignatureDisplay({
  signature,
  width = 400,
  height = 200,
}: SignatureDisplayProps) {
  if (!signature) return null;

  return (
    <div className="inline-block border rounded-md overflow-hidden bg-white max-w-full">
      <div className="relative" style={{ maxWidth: `${width}px` }}>
        <Image
          src={signature}
          alt="Signature"
          width={width}
          height={height}
          className="w-auto h-auto object-contain"
          style={{
            maxWidth: "100%",
            maxHeight: `${height}px`,
          }}
          // Required for data URLs
          unoptimized={true}
        />
      </div>
    </div>
  );
}
