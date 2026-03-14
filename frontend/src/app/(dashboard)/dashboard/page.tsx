import { FiMap, FiLayers, FiBarChart2, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/fade-in";
import { formatNumber } from "@/lib/utils";

const stats = [
  {
    label: "Registered Farms",
    value: formatNumber(0),
    icon: FiLayers,
    color: "bg-forest/10 text-forest",
  },
  {
    label: "Land Analyses",
    value: formatNumber(0),
    icon: FiMap,
    color: "bg-leaf/10 text-leaf",
  },
  {
    label: "Recommendations",
    value: formatNumber(0),
    icon: FiBarChart2,
    color: "bg-soil/40 text-amber-700",
  },
];

const quickActions = [
  {
    label: "Analyze Land",
    description: "Upload terrain data for a new analysis",
    href: "/dashboard/analyze",
    icon: FiMap,
  },
  {
    label: "My Farms",
    description: "View and manage registered farms",
    href: "/dashboard/farms",
    icon: FiLayers,
  },
  {
    label: "Recommendations",
    description: "Review crop and terrace suggestions",
    href: "/dashboard/recommendations",
    icon: FiBarChart2,
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <FadeIn>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-base text-gray-500 mt-1">
            Welcome to STRATA — your agricultural overview.
          </p>
        </header>
      </FadeIn>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.08}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Recent Analyses */}
      <FadeIn delay={0.25}>
        <Card
          title="Recent Analyses"
          description="Your latest land analysis sessions."
          className="mb-6"
        >
          <div className="flex flex-col items-center justify-center h-36 rounded-xl bg-gray-50 text-sm text-gray-400 gap-2">
            <FiMap size={24} className="text-gray-300" />
            No analyses yet. Start by analyzing a piece of land.
          </div>
        </Card>
      </FadeIn>

      {/* Quick Actions */}
      <FadeIn delay={0.3}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(({ label, description, href, icon: Icon }) => (
            <Link key={href} href={href}>
              <Card hover className="group cursor-pointer h-full">
                <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center mb-3 group-hover:bg-forest/20 transition-colors duration-200">
                  <Icon size={16} className="text-forest" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {label}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-forest opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Go <FiArrowRight size={12} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
