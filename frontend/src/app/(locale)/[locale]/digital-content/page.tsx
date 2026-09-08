import { permanentRedirect } from 'next/navigation';

const WOODY_DIGITAL_APP_URL = 'https://woodyvearkadaslari.web.app/';

export default function DigitalContentPage() {
  permanentRedirect(WOODY_DIGITAL_APP_URL);
}
