import './globals.css'

export const metadata = {
  title: 'Primetrade',
  description: 'Primetrade auth app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="font-display dark bg-background-dark text-on-surface-dark">
        {children}
      </body>
    </html>
  )
}
