import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

type PageWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <main className={cn("min-h-screen py-12", className)}>
      <Container>{children}</Container>
    </main>
  );
}
