"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad } from "./signature-pad";

const reasons = [
  { value: "FORGOT_TIME_CARD", label: "Forgot time card" },
  { value: "LOST_TIME_CARD", label: "Lost time card" },
  { value: "FORGOT_TO_PUNCH", label: "Forgot to punch" },
  { value: "IN_THE_FIELD", label: "In the Field (no clock)" },
  { value: "OTHER", label: "Other" },
] as const;

type Reason = (typeof reasons)[number]["value"];

interface FormData {
  name: string;
  sso: string;
  date: string;
  location: string;
  timeIn: string;
  timeOut: string;
  mealIn: string;
  mealOut: string;
  reason: Reason | "";
  otherReason: string;
  amount: string;
  signature: string;
  todayDate: string;
}

const initialFormData: FormData = {
  name: "",
  sso: "",
  date: "",
  location: "",
  timeIn: "",
  timeOut: "",
  mealIn: "",
  mealOut: "",
  reason: "",
  otherReason: "",
  amount: "",
  signature: "",
  todayDate: new Date().toISOString().split("T")[0],
};

export function TimePunchForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showOtherReason, setShowOtherReason] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleReasonChange = (value: string) => {
    setShowOtherReason(value === "OTHER");
    setFormData((prev) => ({
      ...prev,
      reason: value as Reason,
      otherReason: value !== "OTHER" ? "" : prev.otherReason,
    }));
  };

  const handleSignatureChange = (signatureData: string) => {
    setFormData((prev) => ({ ...prev, signature: signatureData }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // TODO: Implement form submission
      console.log("Form submitted:", formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto print:shadow-none">
      <CardHeader>
        <CardTitle>Compensable Time Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (Print)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sso">SSO</Label>
              <Input
                id="sso"
                value={formData.sso}
                onChange={handleInputChange}
                placeholder="Enter SSO"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location #</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeIn">Time IN</Label>
              <Input
                id="timeIn"
                type="time"
                value={formData.timeIn}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeOut">Time OUT</Label>
              <Input
                id="timeOut"
                type="time"
                value={formData.timeOut}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mealIn">Meal IN</Label>
              <Input
                id="mealIn"
                type="time"
                value={formData.mealIn}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealOut">Meal OUT</Label>
              <Input
                id="mealOut"
                type="time"
                value={formData.mealOut}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Missed Punch</Label>
            <Select onValueChange={handleReasonChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showOtherReason && (
            <div className="space-y-2">
              <Label htmlFor="otherReason">Other (please explain)</Label>
              <Input
                id="otherReason"
                value={formData.otherReason}
                onChange={handleInputChange}
                placeholder="Enter explanation"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Employee Signature</Label>
            <SignaturePad onChange={handleSignatureChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="todayDate">Today's Date</Label>
            <Input
              id="todayDate"
              type="date"
              value={formData.todayDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="print:hidden"
            >
              Print
            </Button>
            <Button type="submit" className="print:hidden">
              Submit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
