// app/layout.tsx
import "../styles/globals.css"; // ✅ Adjusted path from './globals.css'

export const metadata = {
  title: "Fantasy Football",
  description: "Fantasy Football Locker Room",
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
