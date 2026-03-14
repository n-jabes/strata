import { Container } from "@/components/ui/container";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-soil/40 bg-white py-8">
      <Container>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-semibold text-forest">{APP_NAME}</span>
          <span className="text-xs text-gray-400">{APP_TAGLINE}</span>
        </div>
      </Container>
    </footer>
  );
}
