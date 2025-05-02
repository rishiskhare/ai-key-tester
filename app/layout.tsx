import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI API Key Tester',
  description: 'Test your API keys from OpenAI, Google, and Anthropic, as well as tokens from Hugging Face',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
