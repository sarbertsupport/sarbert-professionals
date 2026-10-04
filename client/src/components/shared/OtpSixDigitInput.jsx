import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Six single-digit inputs with paste support, SMS OTP hints, and keyboard navigation.
 * Value is a string of up to 6 digits (controlled).
 */
const OtpSixDigitInput = ({
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error = false,
  /** When this value changes (e.g. new MFA session token), the first cell is focused. */
  focusTrigger = null,
  idPrefix = 'otp',
}) => {
  const digits = (value || '').replace(/\D/g, '').slice(0, 6);
  const padded = digits.padEnd(6, ' ');
  const cells = padded.split('');
  const inputsRef = useRef([]);
  const prevLenRef = useRef(0);

  const setFullCode = useCallback(
    (next) => {
      const cleaned = next.replace(/\D/g, '').slice(0, 6);
      onChange(cleaned);
      return cleaned;
    },
    [onChange]
  );

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, 6);
  }, []);

  const focusIndex = useCallback((i) => {
    const el = inputsRef.current[i];
    if (el) el.focus();
    el?.select?.();
  }, []);

  useEffect(() => {
    if (focusTrigger == null || focusTrigger === '') return;
    if (disabled) return;
    const t = requestAnimationFrame(() => focusIndex(0));
    return () => cancelAnimationFrame(t);
  }, [focusTrigger, disabled, focusIndex]);

  useEffect(() => {
    const len = digits.length;
    if (len === 6 && prevLenRef.current < 6 && onComplete && !disabled) {
      onComplete(digits);
    }
    prevLenRef.current = len;
  }, [digits, onComplete, disabled]);

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length === 0) {
      const next = (digits.slice(0, index) + digits.slice(index + 1)).slice(0, 6);
      onChange(next);
      return;
    }
    if (raw.length >= 6) {
      const cleaned = setFullCode(raw);
      focusIndex(Math.min(Math.max(0, cleaned.length - 1), 5));
      return;
    }
    const char = raw.slice(-1);
    const next = digits.slice(0, index) + char + digits.slice(index + 1);
    onChange(next.slice(0, 6));
    if (char && index < 5) {
      focusIndex(index + 1);
    }
  };

  const goPrev = (index) => {
    if (index > 0) {
      focusIndex(index - 1);
    }
  };

  const goNext = (index) => {
    if (index < 5) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const next = (digits.slice(0, index - 1) + digits.slice(index)).slice(0, 6);
        onChange(next);
        focusIndex(index - 1);
      }
      return;
    }
    if (e.key === 'Delete') {
      if (!digits[index] && index < 5) {
        e.preventDefault();
        goNext(index);
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev(index);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext(index);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusIndex(5);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') || '';
    const cleaned = setFullCode(text);
    const len = cleaned.length;
    focusIndex(len >= 6 ? 5 : Math.max(0, len - 1));
  };

  const inputClass =
    'w-10 h-12 sm:w-11 sm:h-14 min-w-0 text-center text-lg font-semibold rounded-xl border-2 outline-none transition-all ' +
    'tabular-nums tracking-wide shadow-sm ' +
    (error
      ? 'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-200/80 '
      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/90 ') +
    'disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:shadow-none';

  return (
    <div
      role="group"
      aria-label="6-digit verification code"
      className="flex justify-center gap-2 sm:gap-3"
      onPaste={handlePaste}
    >
      {cells.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          id={`${idPrefix}-${i}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of 6`}
          aria-invalid={error ? 'true' : undefined}
          spellCheck={false}
          autoCorrect="off"
          className={inputClass}
          value={ch === ' ' ? '' : ch}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
};

export default OtpSixDigitInput;
