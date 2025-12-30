import '@/styles/globals.css';
import '@/styles/App.css';

export const metadata = {
  title: 'Media Notes',
  description: 'Media note taking app',
};

export default function RootLayout({ children }) {
  return (
    <html lang='ja'>
      <head>
        <link
          rel='stylesheet'
          href='https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css'
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
