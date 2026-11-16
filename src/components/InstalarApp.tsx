// Opción «Instalar app» del menú de la cuenta. Solo aparece si el navegador deja instalar (Android/computador) o en Safari de iPhone, donde se explican los pasos.
import { Download } from 'lucide-react';
import { useInstalarApp } from '../lib/pwa';
import { clientToast } from '../utils/clientToast';

const PASOS_IOS = 'En Safari toca Compartir (el cuadrado con la flecha hacia arriba) y elige «Agregar a pantalla de inicio».';

export default function OpcionInstalarApp({ alAccionar }: { alAccionar: () => void }) {
  const { modo, instalar } = useInstalarApp();
  if (!modo) return null;
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        alAccionar();
        if (modo === 'instalar') void instalar();
        else clientToast.info(PASOS_IOS);
      }}
    >
      <Download aria-hidden="true" />
      <span>Instalar app</span>
    </button>
  );
}
