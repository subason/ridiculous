import { ChartType } from 'chart.js';

export interface StatItem { label: string; value: string; }
export interface LegendItem { label: string; percent: string; color: string; }

export interface MetricCardData {
  id: string; name: string; role: string; avatar: string; rankBadge: string;
  themeClass: string; kpiTitle: string; kpiMetric: number; kpiUnit: string;
  changeText?: string;
  footerLeft: string; footerCta: string; tileChartType: ChartType;
  tileChartLabels: string[]; tileChartValues: number[]; tileColors: string[];
  stats: StatItem[]; drillChartType: ChartType; drillChartLabels: string[];
  drillChartValues: number[]; insights: string[]; customWidget?: 'bars' | 'segments';
  votes?: number;
  legendItems?: LegendItem[];
}