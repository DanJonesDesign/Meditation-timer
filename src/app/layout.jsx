import './globals.css'

export const metadata = {
  title: 'Meditation Timer',
  description: 'A gentle meditation timer with customizable sounds',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
