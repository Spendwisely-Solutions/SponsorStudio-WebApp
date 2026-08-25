/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_TWILIO_API_URL?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_EMAILJS_SERVICE_ID_To_EVENTORG?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID_To_EVENTORG?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY_EMAIL_VERIFY?: string;
  readonly VITE_EMAILJS_SERVICE_ID_EMAIL_VERIFY?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID_EMAIL_VERIFY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}