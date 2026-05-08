import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "AI Travel Route Optimizer",
  description: "Find the best multimodal travel routes powered by AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-white font-poppins">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
