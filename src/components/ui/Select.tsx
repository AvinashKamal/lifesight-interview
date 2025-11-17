import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, children, ...rest }: SelectProps) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <select className="field-control" {...rest}>
        {children}
      </select>
    </label>
  );
}
