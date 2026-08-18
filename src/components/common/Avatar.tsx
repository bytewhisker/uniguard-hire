import React, { useState } from 'react';
import { initialsOf } from './recruitmentStages';

const SIZE_MAP: Record<string, string> = {
  sm: 'w-7 h-7 text-[9px]',
  md: 'w-9 h-9 text-[11px]',
  lg: 'w-11 h-11 text-sm',
  xl: 'w-14 h-14 text-base',
};

interface AvatarProps {
  name: string;
  url?: string;
  size?: string; // preset ('sm' | 'md' | 'lg' | 'xl') or raw Tailwind class string
}

export const Avatar: React.FC<AvatarProps> = ({ name, url, size = 'md' }) => {
  const [failed, setFailed] = useState(false);
  const cls = SIZE_MAP[size] ?? size;
  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setFailed(true)}
        className={`${cls} rounded-full object-cover border border-zinc-700/60 shrink-0`}
      />
    );
  }
  return (
    <div className={`${cls} rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-bold text-white shrink-0 border border-zinc-700/60`}>
      {initialsOf(name)}
    </div>
  );
};
