"use client";

import { useState, useEffect } from "react";
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
  employeeId: string;
  supervisorId: string;
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
  employeeId: "",
  supervisorId: "",
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

interface User {
  id: string;
  name: string;
  role: string;
}

export function TimePunchForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showOtherReason, setShowOtherReason] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch employees and supervisors
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const users = await response.json();
        setEmployees(users.filter((user: User) => user.role === "ASSOCIATE"));
        setSupervisors(
          users.filter((user: User) => user.role === "SUPERVISOR")
        );
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEmployeeChange = (value: string) => {
    const employee = employees.find((emp) => emp.id === value);
    if (employee) {
      setFormData((prev) => ({
        ...prev,
        employeeId: value,
        name: employee.name,
      }));
    }
  };

  const handleSupervisorChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      supervisorId: value,
    }));
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
    setLoading(true);

    try {
      const response = await fetch("/api/time-punch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create time punch record");
      }

      // Reset form after successful submission
      setFormData(initialFormData);
      alert("Time punch record created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error creating time punch record");
    } finally {
      setLoading(false);
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
              <Label>Select Employee</Label>
              <Select onValueChange={handleEmployeeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Supervisor</Label>
              <Select onValueChange={handleSupervisorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeIn">Time IN</Label>
              <Input
                id="timeIn"
                type="time"
                value={formData.timeIn}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeOut">Time OUT</Label>
              <Input
                id="timeOut"
                type="time"
                value={formData.timeOut}
                onChange={handleInputChange}
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
            <Label htmlFor="location">Location #</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location number"
              required
            />
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

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="print:hidden"
            >
              Print
            </Button>
            <Button type="submit" className="print:hidden" disabled={loading}>
              {loading ? "Creating..." : "Submit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
