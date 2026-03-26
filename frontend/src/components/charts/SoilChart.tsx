"use client";

import { Card } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getSoilColor, type ChartDatum } from "@/lib/analytics";

type SoilChartProps = {
  data: ChartDatum[];
};

export function SoilChart({ data }: SoilChartProps) {
  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-base font-semibold text-gray-900">Soil Type Distribution</h3>
      <p className="text-xs text-gray-500 mt-1 mb-4">Count of soil types in your analyses</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={84}
              innerRadius={44}
              paddingAngle={2}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={getSoilColor(item.name)} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
