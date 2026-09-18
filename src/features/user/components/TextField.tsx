"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "tel" | "date";
  placeholder?: string;
  className?: string;
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: TextFieldProps) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label
        htmlFor={id}
        className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11"
      />
    </div>
  );
}