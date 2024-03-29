import { Logo } from './logo';

export function AppBanner() {
  return (
    <div className="flex flex-col items-center">
      <Logo className="h-[160px] w-[160px]"/>
      <h1 className="text-5xl font-extrabold tracking-tight">
        <span className="text-[#15dec4]">Short Links </span>
        <span className="text-[#2D3D5D]"> for </span>
        <span className="text-[#FF2E83]">monday.com</span>
      </h1>
    </div>
  );
}
