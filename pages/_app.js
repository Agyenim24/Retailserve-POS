import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { CurrencyProvider } from '../lib/CurrencyContext';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CurrencyProvider>
          <Component {...pageProps} />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #475569',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            }}
          />
        </CurrencyProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
