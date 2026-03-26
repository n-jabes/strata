import Link from "next/link";
import { Container } from "@/components/ui/container";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#d7c097]/45 bg-[#f6efd7] py-10">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-semibold tracking-tight text-[#1a1612]">
              {APP_NAME}
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#5f5342]">
              {APP_TAGLINE}. STRATA helps teams analyze terrain, design smarter
              terraces, and deploy resilient hillside farming strategies with
              data-backed confidence.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2b241c]">
              Platform
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[#5f5342]">
              <Link href="/analyze-land" className="hover:text-[#005f53]">
                Analyze Land
              </Link>
              <Link href="/dashboard" className="hover:text-[#005f53]">
                Dashboard
              </Link>
              <Link href="/community" className="hover:text-[#005f53]">
                Community
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2b241c]">
              Company
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-[#5f5342]">
              <Link href="/#features" className="hover:text-[#005f53]">
                Capabilities
              </Link>
              <Link href="/#about" className="hover:text-[#005f53]">
                About
              </Link>
              <Link href="/register" className="hover:text-[#005f53]">
                Get Started
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#d7c097]/55 pt-4">
          <p className="text-xs text-[#7b6c57]">
            © {year} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
