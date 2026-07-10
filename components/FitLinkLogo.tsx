import Link from "next/link";

type FitLinkLogoProps = {
  href?: string;
  showText?: boolean;
};

export default function FitLinkLogo({
  href = "/",
  showText = true,
}: FitLinkLogoProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-950 shadow-sm">
        <div className="relative h-5 w-5">
          <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-400" />
          <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-green-400" />
          <span className="absolute left-1/2 top-1/2 h-1 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
      </div>

      {showText && (
        <div className="leading-none">
          <p className="text-xl font-black tracking-tight text-gray-950">
            FitLink
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Train. Connect. Grow.
          </p>
        </div>
      )}
    </Link>
  );
}