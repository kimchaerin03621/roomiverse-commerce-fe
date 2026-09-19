import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export default function Reservation() {
  const { content } = useContext(LanguageContext);

  return (
    <div className="w-full min-h-screen bg-white text-black pt-24 pb-20 px-8 flex items-center justify-center">
      <main className="max-w-6xl w-full h-[600px] border border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center text-neutral-400 space-y-2">
        <span className="text-xs font-mono">{content.reservation.placeholder}</span>
      </main>
    </div>
  );
}
