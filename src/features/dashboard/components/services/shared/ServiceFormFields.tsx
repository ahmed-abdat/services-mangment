"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ServiceFormFieldsProps {
  serviceName: string;
  setServiceName: (name: string) => void;
  hasError?: boolean;
  showValidation?: boolean;
}

export default function ServiceFormFields({
  serviceName,
  setServiceName,
  hasError = false,
  showValidation = false,
}: ServiceFormFieldsProps) {
  return (
    <div className="grid gap-4 py-4">
      <Label htmlFor="service-name" className="text-lg">
        Service Name
      </Label>
      <Input
        type="text"
        id="service-name"
        value={serviceName}
        onChange={(e) => setServiceName(e.target.value)}
        className={cn({
          "focus-visible:ring-red-500": hasError,
        })}
        placeholder="chatgpt"
      />

      {showValidation && !serviceName && (
        <p className="text-sm text-red-500">Please enter service name</p>
      )}
    </div>
  );
}
