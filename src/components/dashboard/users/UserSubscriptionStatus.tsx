import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function UserSubscriptionStatus({
    onValueChange,
    value,
} : {
    onValueChange : (value : string) => void,
    value : string,
}) {
    // ["Active", "Expired"]
  return (
    <Select onValueChange={onValueChange} value={value}>
      <Label>Subscription Status</Label>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
