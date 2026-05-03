import React from 'react';
import { OTPInput, SlotProps } from 'input-otp';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

export const ShadcnOTPInput: React.FC<OTPInputProps> = ({ value, onChange, maxLength = 4, disabled }) => {
  return (
    <div className="flex justify-center w-full" dir="ltr">
      <OTPInput
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        disabled={disabled}
        containerClassName="group flex items-center has-[:disabled]:opacity-50"
        render={({ slots }) => (
          <div className="flex gap-3">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />
    </div>
  );
};

function Slot(props: SlotProps) {
  return (
    <div
      className={`
        relative w-12 h-14 text-xl flex items-center justify-center transition-all duration-300
        border-2 rounded-xl bg-glass backdrop-blur-md font-bold
        ${props.isActive ? 'border-brand-500 ring-4 ring-brand-500/10 scale-105' : 'border-border'}
        ${props.char ? 'text-primary' : 'text-secondary/30'}
      `}
    >
      {props.char !== null ? (
        <div className="animate-in fade-in zoom-in duration-300">{props.char}</div>
      ) : (
        <div className="w-1 h-1 rounded-full bg-current opacity-20" />
      )}
      {props.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-0.5 animate-caret-blink bg-brand-500 duration-1000" />
        </div>
      )}
    </div>
  );
}
