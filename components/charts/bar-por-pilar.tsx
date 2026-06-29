"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BarPorPilar({
  data,
}: {
  data: { pilar: string; valor: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis dataKey="pilar" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        <Bar dataKey="valor" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
