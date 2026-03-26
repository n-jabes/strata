"use client";

import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDatum } from "@/lib/analytics";

type RainfallChartProps = {
  data: ChartDatum[];
};

export function RainfallChart({ data }: RainfallChartProps) {
  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-base font-semibold text-gray-900">Rainfall Distribution</h3>
      <p className="text-xs text-gray-500 mt-1 mb-4">Low, medium, and high rainfall categories</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#73AF6F" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
