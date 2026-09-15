"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberFieldProps {
  id: string;
  name: string;
  label: string;
  value: number | "";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function NumberField({ id, name, label, value, onChange, placeholder }: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11"
      />
    </div>
  );
}