import React, { useState } from 'react';
import { initialsOf } from './recruitmentStages';

interface AvatarProps {
  name: string;
  url?: string;
  size?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, url, size = 'w-9 h-9' }) => {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setFailed(true)}
        className={`${size} rounded-full object-cover border border-line-strong shrink-0`}
      />
    );
  }
  return (
    <div className={`${size} rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0 border border-line-strong`}>
      {initialsOf(name)}
    </div>
  );
};
