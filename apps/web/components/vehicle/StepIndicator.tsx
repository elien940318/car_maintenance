'use client';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const isDone = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <div key={idx} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                style={{
                  background: isActive ? 'var(--mint)' : 'var(--bg2)',
                  color: isActive ? '#0b0f19' : isDone ? 'var(--mint)' : 'var(--muted)',
                  border: isDone ? '1.5px solid var(--mint)' : 'none',
                }}
              >
                {isDone ? '✓' : idx}
              </div>
              <span
                className="text-[10px] mt-1 whitespace-nowrap"
                style={{ color: isActive ? 'var(--mint)' : 'var(--muted)' }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-px w-8 sm:w-16 mx-1 mb-4"
                style={{ background: isDone ? 'var(--mint)' : 'var(--border)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
