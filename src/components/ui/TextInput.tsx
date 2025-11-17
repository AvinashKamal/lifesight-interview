import React from "react";

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function TextInput({ label, ...rest }: TextInputProps) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <input className="field-control" {...rest} />
    </label>
  );
}
