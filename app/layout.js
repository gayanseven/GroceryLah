import "./globals.css";

export const metadata = {
  title: "GroceryLah — Weekly Grocery Planner",
  description:
    "Weekly grocery planner for Singapore families. Plan in 5 minutes, share on WhatsApp, learn prices from receipts, stick to your budget.",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f5d38",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
