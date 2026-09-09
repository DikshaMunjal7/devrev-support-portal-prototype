import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "DevRev Support Portal",
  description: "Automated Ticket Triage Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
