"use client";

import Link from "next/link";
import { FiMap, FiLayers, FiBarChart2, FiArrowRight } from "react-icons/fi";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { FeatureCard } from "@/features/marketing/components/feature-card";

const features = [
  {
    icon: FiMap,
    title: "Land Analysis",
    description:
      "Upload hillside terrain data and receive a detailed breakdown of slope gradients, soil stability, and erosion risk.",
  },
  {
    icon: FiLayers,
    title: "Crop Recommendations",
    description:
      "Receive tailored crop suggestions based on soil type, altitude, rainfall patterns, and climate zone.",
  },
  {
    icon: FiBarChart2,
    title: "Terrace Planning",
    description:
      "Generate optimized terrace layouts designed to maximize yield while protecting hillside soil.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="h-[calc(100vh-4rem)] flex items-center overflow-hidden py-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest bg-forest/10 px-3 py-1.5 rounded-full mb-5">
                  Launching in Africa
                </span>
                <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
                  Smart Terraced Agriculture{" "}
                  <span className="text-forest">for Africa</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.1}>
                <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                  STRATA helps farmers analyze hillside land and generate
                  sustainable cultivation plans that protect soil and maximize
                  yield.
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="flex flex-wrap gap-3">
                  <Link href="/analyze-land">
                    <Button variant="primary">
                      Analyze Land
                      <FiArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link href="/#features">
                    <Button variant="ghost">Learn More</Button>
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Illustration placeholder */}
            <FadeIn delay={0.15}>
              <div className="relative hidden lg:block">
                <div className="h-[min(52vh,360px)] w-full ml-auto rounded-3xl bg-gradient-to-br from-forest/20 via-leaf/20 to-sand overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-forest/30" />
                    <div className="absolute bottom-8 right-6 w-24 h-24 rounded-full bg-leaf/40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-10 rounded-full bg-soil/60" />
                  </div>
                  <p className="relative z-10 text-4xl font-black text-forest/20 tracking-widest select-none">
                    STRATA
                  </p>
                </div>
                <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-2xl bg-soil/60 -z-10" />
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-leaf/30 -z-10" />
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <Container>
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Everything you need to farm smarter
              </h2>
              <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                From terrain analysis to crop planning — STRATA gives you the
                tools to make informed agricultural decisions.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.1}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section id="about" className="py-24">
        <Container>
          <FadeIn>
            <div className="rounded-3xl bg-forest px-8 py-16 text-center">
              <h2 className="text-3xl font-semibold text-white mb-4">
                Ready to transform your land?
              </h2>
              <p className="text-base text-white/70 mb-8 max-w-md mx-auto">
                Start your first land analysis today and receive a custom
                cultivation plan in minutes.
              </p>
              <Link href="/analyze-land">
                <Button variant="secondary">
                  Get Started Free
                  <FiArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>

      <Footer />
    </>
  );
}
