"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMap,
  FiLayers,
  FiBarChart2,
  FiArrowRight,
  FiActivity,
  FiShield,
  FiSun,
  FiDroplet,
  FiTarget,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";

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

const terrainCards = [
  {
    title: "Soil Stability",
    value: "86%",
    icon: FiShield,
  },
  {
    title: "Water Retention",
    value: "+31%",
    icon: FiDroplet,
  },
  {
    title: "Sun Exposure",
    value: "7.2h",
    icon: FiSun,
  },
];

const platformPillars = [
  {
    title: "Terrain Intelligence",
    description:
      "Build slope-aware terrain maps from your land inputs and instantly identify stability zones, erosion corridors, and terrace-ready bands.",
    icon: FiTarget,
  },
  {
    title: "Adaptive Crop Strategy",
    description:
      "Generate crop plans aligned to elevation, micro-climate, and water behavior so recommendations are practical for real hillside conditions.",
    icon: FiTrendingUp,
  },
  {
    title: "Execution Blueprint",
    description:
      "Move from analysis to action with terrace layouts, intervention priorities, and implementation guidance your team can follow on the ground.",
    icon: FiCheckCircle,
  },
];

const workflow = [
  {
    step: "01",
    title: "Upload or map your terrain",
    detail:
      "Import hillside geometry and contextual farm data to initialize STRATA's terrain engine.",
  },
  {
    step: "02",
    title: "Simulate agronomic outcomes",
    detail:
      "Run slope, runoff, and crop suitability models to evaluate performance before implementation.",
  },
  {
    step: "03",
    title: "Deploy optimized terrace plans",
    detail:
      "Export practical recommendations for terrace design, crop selection, and resilient land management.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <section className="relative h-[calc(100vh-4rem)] overflow-hidden bg-[#1a1612] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(115,175,111,0.3),transparent_36%),radial-gradient(circle_at_76%_18%,rgba(0,126,110,0.34),transparent_38%),radial-gradient(circle_at_52%_82%,rgba(215,192,151,0.27),transparent_48%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(120deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:42px_42px]"
        />

        <Container className="h-full">
          <div className="grid h-full grid-cols-1 items-center gap-8 py-6 lg:grid-cols-2 lg:gap-12 lg:py-8">
            <div>
              <FadeIn>
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7c097]/35 bg-[#d7c097]/10 px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase text-[#e7deaf] backdrop-blur">
                  Regenerative Terrain Intelligence
                </span>
                <h1 className="mb-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  The Future of
                  <span className="block bg-gradient-to-r from-[#e7deaf] via-[#73af6f] to-[#d7c097] bg-clip-text text-transparent">
                    Terraced Farming
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.1}>
                <p className="mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                  STRATA turns topography into actionable design. Simulate slope
                  layers, place terrace interventions, and deploy resilient crop
                  strategies from one immersive command center.
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="flex flex-wrap gap-3">
                  <Link href="/analyze-land">
                    <Button
                      variant="primary"
                      className="!bg-[#e7deaf] !text-[#1a1612] hover:!bg-[#d7c097]"
                    >
                      Analyze Land
                      <FiArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link href="/#features">
                    <Button
                      variant="ghost"
                      className="!border !border-[#d7c097]/40 !bg-[#e7deaf]/10 !text-[#f5efd2] hover:!bg-[#e7deaf]/20"
                    >
                      Explore Capabilities
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                  {terrainCards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-[#d7c097]/30 bg-[#1f1a15]/60 p-3 backdrop-blur-sm"
                    >
                      <div className="mb-1 inline-flex rounded-lg bg-[#73af6f]/20 p-1.5 text-[#e7deaf]">
                        <card.icon size={13} />
                      </div>
                      <p className="text-[11px] tracking-wide text-[#e7deaf]/70 uppercase">
                        {card.title}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#f8f3df]">
                        {card.value}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.15}>
              <div className="relative mx-auto w-full max-w-[780px] lg:mr-0 lg:max-w-[900px] lg:translate-x-6 lg:-translate-y-4">
                <div className="relative aspect-[1.2/1] rounded-[2rem] border border-[#d7c097]/25 bg-gradient-to-b from-[#e7deaf]/14 via-[#73af6f]/7 to-transparent p-3 sm:p-4 backdrop-blur-md">
                  <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.56),transparent_60%)]" />

                  <motion.div
                    animate={{ y: [0, -4, 0], rotate: [-0.45, 0.45, -0.45] }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-10 ml-auto mt-[-9%] h-[116%] w-[118%] [perspective:1000px] sm:mt-[-12%] sm:h-[122%] sm:w-[124%]"
                  >
                    <div className="relative h-full w-full [transform-style:preserve-3d] [transform:rotateX(18deg)_rotateY(-1deg)]">
                      <Image
                        src="/terraced_hill.png"
                        alt="Terraced hill model"
                        fill
                        className="object-contain scale-[1.35] sm:scale-[1.4] drop-shadow-[0_45px_55px_rgba(0,0,0,0.62)]"
                        priority
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                    className="absolute left-[-8%] top-[44%] z-20 w-[132px] rounded-xl border border-[#d7c097]/30 bg-[#17120f]/90 p-2.5 backdrop-blur-md sm:w-[165px] sm:p-3"
                  >
                    <div className="absolute -bottom-6 left-32 h-6 w-px bg-gradient-to-b from-[#d7c097] to-transparent" />
                    <p className="text-[10px] tracking-[0.12em] text-[#e7deaf]/85 uppercase">
                      Active Layer
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#f5efd2]">
                      Slope Class A3
                    </p>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{
                      duration: 8.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                    className="absolute bottom-[64%] right-[-4%] z-20 w-[150px] rounded-xl border border-[#d7c097]/30 bg-[#1a1612]/90 p-2.5 backdrop-blur-md sm:w-[180px] sm:p-3"
                  >
                    <div className="absolute -left-14 top-5 h-px w-14 bg-gradient-to-r from-transparent to-[#d7c097]" />
                    <div className="mb-2 flex items-center gap-1 text-xs text-[#e7deaf]">
                      <FiActivity />
                      Terrace Signal
                    </div>
                    <div className="h-1.5 rounded-full bg-[#d7c097]/20">
                      <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#73af6f] to-[#e7deaf]" />
                    </div>
                    <p className="mt-1 text-xs text-[#f8f3df]/85">
                      readiness: 82%
                    </p>
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[57%] top-[47%] h-3 w-3 rounded-full bg-[#e7deaf]/70 shadow-[0_0_16px_4px_rgba(231,222,175,0.4)]"
                  />

                  <div className="absolute -bottom-4 left-1/2 h-16 w-[64%] -translate-x-1/2 rounded-[50%] bg-[#007e6e]/32 blur-3xl" />
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      <section
        id="features"
        className="relative overflow-hidden bg-[#efe5c8] py-18 sm:py-24"
      >
        <div
          aria-hidden="true"
          className="absolute -top-28 left-1/3 h-72 w-72 rounded-full bg-[#73af6f]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute top-10 right-10 h-56 w-56 rounded-full bg-[#007e6e]/30 blur-3xl"
        />
        <Container>
          <FadeIn>
            <div className="mb-10 text-center sm:mb-16">
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[#2b241c] sm:text-4xl">
                What STRATA Delivers
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#5f5342] sm:text-base">
                STRATA is an intelligent land-planning platform for hillside
                agriculture. It combines geospatial analysis, agronomic insight,
                and practical execution guidance so farmers and project teams can
                make confident, data-backed decisions.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.1}>
                <div className="group h-full rounded-2xl border border-[#1a1612]/10 bg-[#fbf8ec] p-6 shadow-[0_20px_45px_-30px_rgba(26,22,18,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(26,22,18,0.35)]">
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-[#d7c097]/55 to-[#73af6f]/35 p-3 text-[#005f53]">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#2b241c]">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5f5342]">
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#f4ecd1] py-16 sm:py-20">
        <Container>
          <FadeIn>
            <div className="mb-10 text-center sm:mb-14">
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-[#2b241c] sm:text-4xl">
                How The Platform Works
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#5f5342] sm:text-base">
                From terrain capture to implementation, every step is designed
                to reduce uncertainty and accelerate execution quality.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {workflow.map((item, index) => (
              <FadeIn key={item.step} delay={index * 0.08}>
                <div className="h-full rounded-2xl border border-[#1a1612]/10 bg-[#fbf7e8] p-6 shadow-[0_18px_40px_-28px_rgba(26,22,18,0.35)]">
                  <span className="inline-flex rounded-full border border-[#007e6e]/35 bg-[#007e6e]/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#005f53]">
                    STEP {item.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#2b241c]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5f5342]">
                    {item.detail}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section
        id="about"
        className="relative overflow-hidden bg-gradient-to-br from-[#1a1612] via-[#264137] to-[#005f53] py-16 sm:py-24"
      >
        <div
          aria-hidden
          className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-[#d7c097]/20 blur-3xl"
        />
        <Container>
          <FadeIn>
            <div className="rounded-3xl border border-[#d7c097]/25 bg-[#e7deaf]/10 px-6 py-12 text-center backdrop-blur-md sm:px-8 sm:py-16">
              <h2 className="mb-4 text-2xl font-semibold text-white sm:text-3xl">
                Ready to modernize your hillside operations?
              </h2>
              <p className="mx-auto mb-7 max-w-xl text-sm text-white/80 sm:text-base">
                Use STRATA to plan smarter terraces, improve soil resilience,
                and deploy crop strategies with measurable confidence.
              </p>
              <Link href="/analyze-land">
                <Button className="!bg-[#e7deaf] !text-[#1a1612] hover:!bg-[#d7c097]">
                  Launch Interactive Analysis
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
