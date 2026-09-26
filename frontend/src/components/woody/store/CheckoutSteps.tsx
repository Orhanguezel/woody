import { Check } from 'lucide-react';

/** Sepet → Üyelik → Adres & fatura → Ödeme adım göstergesi. */
export default function CheckoutSteps({ labels, current, ariaLabel }: { labels: Array<string | undefined>; current: number; ariaLabel?: string }) {
  const steps = labels.filter(Boolean) as string[];
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px] font-black sm:gap-3 sm:text-[13px]" aria-label={ariaLabel}>
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex shrink-0 items-center gap-2 sm:gap-3" aria-current={active ? 'step' : undefined}>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] ${done ? 'bg-[#0c8f74] text-white' : active ? 'bg-[#f58220] text-white' : 'bg-white text-[#9a8a74] ring-1 ring-[#eadfce]'}`}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </span>
            <span className={active ? 'text-[#24333f]' : done ? 'text-[#0c8f74]' : 'text-[#9a8a74]'}>{label}</span>
            {index < steps.length - 1 ? <span className="h-px w-6 bg-[#eadfce] sm:w-10" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
