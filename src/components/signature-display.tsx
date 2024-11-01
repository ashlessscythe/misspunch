"use client";

interface SignatureDisplayProps {
  signatureData: string;
  width?: number;
  height?: number;
}

export function SignatureDisplay({
  signatureData,
  width = 400,
  height = 200,
}: SignatureDisplayProps) {
  return (
    <div className="border rounded-md p-2 bg-white inline-block">
      <img src={signatureData} alt="Signature" width={width} height={height} />
    </div>
  );
}
