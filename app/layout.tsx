"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Wrap the whole app so useSession() is always defined */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
