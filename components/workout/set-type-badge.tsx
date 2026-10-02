'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { SetType } from '@/lib/types/workout';

interface SetTypeBadgeProps {
  setNumber: number;
  setType: SetType;
  onChangeType: (type: SetType) => void;
  disabled?: boolean;
  isCompleted?: boolean;
}

const SET_TYPES: { type: SetType; label: string; badge: string; color: string; desc: string }[] = [
  {
    type: 'normal',
    label: 'Normal Set',
    badge: 'N',
    color: 'bg-[#2c2c2e] border-white/10 text-white hover:border-white/30',
    desc: 'Standard set, counts toward volume and PRs',
  },
  {
    type: 'warmup',
    label: 'Warm-up Set',
    badge: 'W',
    color: 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30',
    desc: 'Acclimation set, excluded from volume and PRs',
  },
  {
    type: 'dropset',
    label: 'Drop Set',
    badge: 'D',
    color: 'bg-blue-500/20 border-blue-500/40 text-[#2997ff] hover:bg-blue-500/30',
    desc: 'Weight dropped mid-set, counts in volume',
  },
  {
    type: 'failure',
    label: 'Failure Set',
    badge: 'F',
    color: 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30',
    desc: 'Max effort to muscular failure, counts in volume and PRs',
  },
];

export function SetTypeBadge({
  setNumber,
  setType,
  onChangeType,
  disabled = false,
  isCompleted = false,
}: SetTypeBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentConfig = SET_TYPES.find((t) => t.type === setType) || SET_TYPES[0];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
          setType === 'normal'
            ? isCompleted
              ? 'text-white font-bold hover:bg-white/10'
              : 'text-[#8e8e93] hover:text-white hover:bg-white/5'
            : `border shadow-xs ${currentConfig.color}`
        }`}
        title={`Set #${setNumber} (${currentConfig.label}) - click to change`}
        aria-label={`Set number ${setNumber}, type ${currentConfig.label}`}
      >
        {setType === 'normal' ? setNumber : currentConfig.badge}
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-48 sm:w-56 p-1.5 bg-surface-raised border border-border/90 rounded-2xl shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-text-subtle font-semibold border-b border-border/50 mb-1">
            Set Type
          </div>
          <div className="space-y-0.5">
            {SET_TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => {
                  onChangeType(t.type);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                  setType === t.type
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-text-primary hover:bg-surface-hover'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md border text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${t.color}`}
                >
                  {t.badge}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium leading-none">{t.label}</div>
                  <div className="text-[10px] text-text-subtle truncate mt-0.5">
                    {t.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
