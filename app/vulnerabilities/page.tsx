"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import {
  vulnerabilityData,
  monthlyTrends,
  severityColors,
} from "@/lib/vulnerability-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Shield,
  Activity,
} from "lucide-react";

export default function VulnerabilitiesPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  const filtered =
    selectedSeverity === "all"
      ? vulnerabilityData
      : vulnerabilityData.filter((v) => v.severity === selectedSeverity);

  const severityCounts = {
    Critical: vulnerabilityData.filter((v) => v.severity === "Critical").length,
    High: vulnerabilityData.filter((v) => v.severity === "High").length,
    Medium: vulnerabilityData.filter((v) => v.severity === "Medium").length,
    Low: vulnerabilityData.filter((v) => v.severity === "Low").length,
  };

  const pieData = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value,
    color: severityColors[name as keyof typeof severityColors],
  }));

  const trendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-destructive" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-primary" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const totalVulns = vulnerabilityData.reduce((acc, v) => acc + v.count, 0);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Dashboard"
          title="Vulnerability Visualization"
          description="Interactive dashboards showing real-time vulnerability trends, severity distributions, and category breakdowns."
        />

        {/* Summary Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Vulnerabilities",
              value: totalVulns.toLocaleString(),
              icon: AlertTriangle,
              color: "text-chart-4",
            },
            {
              label: "Critical Issues",
              value: vulnerabilityData
                .filter((v) => v.severity === "Critical")
                .reduce((a, v) => a + v.count, 0)
                .toLocaleString(),
              icon: Shield,
              color: "text-chart-5",
            },
            {
              label: "Trending Up",
              value: vulnerabilityData.filter((v) => v.trend === "up").length,
              icon: TrendingUp,
              color: "text-chart-4",
            },
            {
              label: "Resolved (↓ Trend)",
              value: vulnerabilityData.filter((v) => v.trend === "down").length,
              icon: Activity,
              color: "text-primary",
            },
          ].map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                    <card.icon className={`h-8 w-8 ${card.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Vulnerability Trends</CardTitle>
              <CardDescription>
                Vulnerability counts by severity over 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="month" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                  <Area
                    type="monotone"
                    dataKey="critical"
                    stackId="1"
                    stroke={severityColors.Critical}
                    fill={severityColors.Critical}
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stackId="1"
                    stroke={severityColors.High}
                    fill={severityColors.High}
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="medium"
                    stackId="1"
                    stroke={severityColors.Medium}
                    fill={severityColors.Medium}
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="low"
                    stackId="1"
                    stroke={severityColors.Low}
                    fill={severityColors.Low}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
              <CardDescription>
                Breakdown of vulnerabilities by severity level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                    labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bar chart */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Vulnerability Counts by Type</CardTitle>
            <CardDescription>
              Number of reported instances for each vulnerability type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filtered} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis type="number" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                <YAxis dataKey="name" type="category" width={120} fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {filtered.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={severityColors[entry.severity]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Line */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Critical & High Severity Trends</CardTitle>
            <CardDescription>
              Monthly trend of critical and high severity vulnerabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                <YAxis fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke={severityColors.Critical}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke={severityColors.High}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vulnerability table */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>All Vulnerabilities</CardTitle>
                <CardDescription>Detailed list with severity and trends</CardDescription>
              </div>
              <div className="flex gap-2">
                {["all", "Critical", "High", "Medium", "Low"].map((sev) => (
                  <Button
                    key={sev}
                    size="sm"
                    variant={selectedSeverity === sev ? "default" : "outline"}
                    onClick={() => setSelectedSeverity(sev)}
                  >
                    {sev}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Vulnerability</th>
                    <th className="py-3 px-4 text-left font-medium">Severity</th>
                    <th className="py-3 px-4 text-left font-medium">Category</th>
                    <th className="py-3 px-4 text-right font-medium">Count</th>
                    <th className="py-3 px-4 text-center font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((vuln) => (
                    <tr key={vuln.name} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{vuln.name}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            vuln.severity === "Critical"
                              ? "destructive"
                              : vuln.severity === "High"
                              ? "default"
                              : vuln.severity === "Medium"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {vuln.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {vuln.category}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {vuln.count.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 flex justify-center">
                        {trendIcon(vuln.trend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
