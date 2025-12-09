import './globals.css'

export const metadata = {
  title: 'Primetrade',
  description: 'Primetrade auth app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,0..200&display=swap"
        />
      </head>
      <body className="font-display dark bg-background-dark text-on-surface-dark">
        {children}
      </body>
    </html>
  )
}
