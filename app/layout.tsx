import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fantasy Football",
  description: "League rosters and more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
