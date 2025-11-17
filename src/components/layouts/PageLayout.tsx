import React from "react";

type PageLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">{title}</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
