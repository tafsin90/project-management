import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Project Management Dashboard",
  description: "A Next.js port of the project management UI",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
