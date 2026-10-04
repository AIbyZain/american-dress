"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { usePrice } from "@/components/shared/price";

export function SalesChart({ data }: { data: { label: string; revenue: number; orders: number }[] }) {
  const fmt = usePrice();
  return (
    <div className="h-[280px] w-full" role="img" aria-label="Revenue per day for the last 30 days">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E8E5DF" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#777777" }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fontSize: 11, fill: "#777777" }}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          />
          <Tooltip
            cursor={{ fill: "#F7F6F3" }}
            contentStyle={{ border: "1px solid #E8E5DF", borderRadius: 0, fontSize: 13 }}
            formatter={(v) => [fmt(Number(v)), "Revenue"]}
          />
          <Bar dataKey="revenue" fill="#171717" maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
