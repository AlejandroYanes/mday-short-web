import Link from 'next/link';

import { Logo } from './logo';
import { env } from '../env';

export function AppBanner() {
  return (
    <Link href={env.PLATFORM_URL}>
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <Logo className="h-[160px] w-[160px]"/>
        </div>
        <h1 className="text-5xl text-center font-extrabold tracking-tight mt-4">
          <span className="text-[#15dec4]">Simple, fast </span>
          <span className="text-[#2D3D5D] dark:text-white">and reliable </span>
          <span className="text-[#FF2E83]">link shortener</span>
        </h1>
      </div>
    </Link>
  );
}
