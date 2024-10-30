"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/signature-pad";
import { Card, CardContent } from "@/components/ui/card";

interface SignatureFormProps {
  timePunchId: string;
}

export function SignatureForm({ timePunchId }: SignatureFormProps) {
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignatureChange = (signatureData: string) => {
    setSignature(signatureData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/time-punch/${timePunchId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature,
          signatureDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save signature");
      }

      router.push("/dashboard/supervisor");
    } catch (error) {
      console.error("Error saving signature:", error);
      alert("Error saving signature");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Employee Signature
                </label>
                <div className="max-w-xl mx-auto">
                  <SignaturePad onChange={handleSignatureChange} />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrint}
                  className="print:hidden"
                >
                  Print for Manual Signature
                </Button>
                <Button
                  type="submit"
                  className="print:hidden"
                  disabled={loading || !signature}
                >
                  {loading ? "Saving..." : "Save Signature"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
