import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Provider from "./provider";

export const metadata = {
  title: "VERITUS - AI Career Intelligence and Placement Readiness",
  description: "From Potential to Placement: An AI-Powered Career Intelligence and Placement Readiness Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
