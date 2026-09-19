import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export default function About() {
  const { content } = useContext(LanguageContext);

  return (
    <div className="page-container bg-white text-black pb-28 select-none">
      <div className="w-full flex flex-col">
        {content.about.sections.map((title, index) => (
          <section
            key={title}
            className="w-full flex flex-col"
            style={index > 0 ? { marginTop: '100px' } : undefined}
          >
            <h2 className="text-sm font-bold text-black tracking-tight mb-3">{title}</h2>
            <div className="relative w-full h-[320px] sm:h-[420px] bg-[#e2e2e2] border border-neutral-300 overflow-hidden">
              <svg className="w-full h-full stroke-neutral-400 stroke-[0.75]" viewBox="0 0 1000 500" preserveAspectRatio="none">
                <line x1="0" y1="0" x2="1000" y2="500" />
                <line x1="1000" y1="0" x2="0" y2="500" />
              </svg>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
