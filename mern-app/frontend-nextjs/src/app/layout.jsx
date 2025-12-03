import './globals.css'

export const metadata = {
  title: 'Primetrade',
  description: 'Primetrade auth app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="font-display dark bg-slate-950 text-white">
        {children}
      </body>
    </html>
  )
}
