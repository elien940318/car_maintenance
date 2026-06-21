'use client';
import { useEffect, useRef } from 'react';
import { CATEGORY_COLORS, CATEGORY_GROUPS } from '../../lib/codes';
import type { PartWithSchedule, Vehicle } from '../../lib/types';
import { usePanelStore } from '../../store/panelStore';

const MONTH_PX = 80;
const LEFT_COL = 180;
const ROW_H = 44;
const MONTHS_BEFORE = 6;
const TOTAL_MONTHS = 42; // 6 before + 36 future

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function monthDiff(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

function dayDiff(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function dateToX(date: Date, chartStart: Date): number {
  const days = dayDiff(chartStart, date);
  return (days / 30) * MONTH_PX;
}

interface GanttChartProps {
  parts: PartWithSchedule[];
  vehicle: Vehicle;
}

export function GanttChart({ parts, vehicle }: GanttChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openPanel } = usePanelStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 차트 시작: 6개월 전 달의 1일
  const chartStart = new Date(today.getFullYear(), today.getMonth() - MONTHS_BEFORE, 1);
  const chartEnd = addMonths(chartStart, TOTAL_MONTHS);
  const totalWidth = TOTAL_MONTHS * MONTH_PX;

  // TODAY x 좌표
  const todayX = dateToX(today, chartStart);

  // 초기 스크롤: TODAY가 가시 영역의 25% 지점
  useEffect(() => {
    if (!scrollRef.current) return;
    const containerW = scrollRef.current.clientWidth;
    const targetScroll = Math.max(0, todayX - containerW * 0.25);
    scrollRef.current.scrollLeft = targetScroll;
  }, [todayX]);

  // 월 눈금 헤더 생성
  const monthLabels: { x: number; label: string; isYearStart: boolean }[] = [];
  for (let m = 0; m < TOTAL_MONTHS; m++) {
    const d = addMonths(chartStart, m);
    const x = m * MONTH_PX;
    monthLabels.push({
      x,
      label: m % 3 === 0 ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}` : '',
      isYearStart: d.getMonth() === 0,
    });
  }

  // 순서대로 정렬된 parts (CATEGORY_GROUPS 순)
  const orderedParts: PartWithSchedule[] = [];
  CATEGORY_GROUPS.forEach(({ categories }) => {
    parts.filter((p) => categories.includes(p.category)).forEach((p) => orderedParts.push(p));
  });

  const totalHeight = orderedParts.length * ROW_H + 40; // 40: 헤더 높이

  return (
    <div className="relative" style={{ overflow: 'hidden' }}>
      {/* 고정 좌측 열 */}
      <div
        className="absolute top-0 left-0 z-10"
        style={{ width: LEFT_COL, background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}
      >
        <div style={{ height: 40, borderBottom: '1px solid var(--border)' }} />
        {orderedParts.map((p) => {
          const catColor = CATEGORY_COLORS[p.category] ?? '#6b7a99';
          return (
            <div
              key={p.id}
              className="flex items-center px-3 cursor-pointer hover:opacity-80"
              style={{ height: ROW_H, borderBottom: '1px solid var(--border)' }}
              onClick={() => openPanel(p, vehicle)}
            >
              <span className="text-xs truncate font-medium" style={{ color: catColor }}>{p.name}</span>
            </div>
          );
        })}
      </div>

      {/* 스크롤 가능한 타임라인 영역 */}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ marginLeft: LEFT_COL }}
      >
        <svg width={totalWidth} height={totalHeight} style={{ display: 'block' }}>
          {/* 월 눈금 배경선 */}
          {monthLabels.map(({ x, label, isYearStart }) => (
            <g key={x}>
              <line x1={x} y1={0} x2={x} y2={totalHeight}
                stroke={isYearStart ? 'var(--border)' : 'var(--bg3)'}
                strokeWidth={isYearStart ? 1.5 : 1} />
              {label && (
                <text x={x + 4} y={14} fontSize={10} fill={isYearStart ? 'var(--text)' : 'var(--muted)'}>
                  {label}
                </text>
              )}
            </g>
          ))}

          {/* TODAY 수직선 */}
          <line x1={todayX} y1={0} x2={todayX} y2={totalHeight}
            stroke="var(--mint)" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={todayX + 4} y={14} fontSize={10} fill="var(--mint)" fontWeight="bold">TODAY</text>

          {/* 각 부품 행 */}
          {orderedParts.map((p, i) => {
            const y = 40 + i * ROW_H;
            const { schedule, lastRecord } = p;
            const catColor = CATEGORY_COLORS[p.category] ?? '#6b7a99';

            if (p.is_chain) {
              // Chain 배너
              return (
                <g key={p.id}>
                  <rect x={0} y={y + 6} width={totalWidth} height={ROW_H - 12} rx={4}
                    fill={catColor} fillOpacity={0.08}
                    stroke={catColor} strokeOpacity={0.3} strokeWidth={1} />
                  <text x={totalWidth / 2} y={y + ROW_H / 2 + 4} textAnchor="middle"
                    fontSize={10} fill={catColor} fillOpacity={0.6}>교체 불필요</text>
                </g>
              );
            }

            if (!schedule.nextDate) return <g key={p.id} />;

            const nextDate = new Date(schedule.nextDate);

            // 최근 교환일 (lastRecord 또는 추정 기준)
            let lastDate: Date | null = null;
            if (lastRecord?.record_date) {
              lastDate = new Date(lastRecord.record_date);
            } else if (schedule.baseline === 'estimated') {
              lastDate = new Date(vehicle.reference_date);
            }

            // 미래 교환 예정일 계산
            let futureEnd: Date | null = null;
            if (p.interval_months) {
              futureEnd = addMonths(nextDate, p.interval_months);
            } else if (p.interval_km && vehicle.monthly_km > 0) {
              const futureDays = Math.round((p.interval_km / vehicle.monthly_km) * 30);
              futureEnd = new Date(nextDate.getTime() + futureDays * 86400000);
            }

            const clamp = (x: number) => Math.max(0, Math.min(x, totalWidth));

            const x1Done = lastDate ? clamp(dateToX(lastDate, chartStart)) : null;
            const x2Done = clamp(todayX);
            const x1Next = clamp(todayX);
            const x2Next = clamp(dateToX(nextDate, chartStart));
            const x1Future = clamp(dateToX(nextDate, chartStart));
            const x2Future = futureEnd ? clamp(dateToX(futureEnd, chartStart)) : null;

            // 다음 교환 핀 레이블 (월 표시)
            const pinLabel = `${nextDate.getMonth() + 1}월`;

            return (
              <g key={p.id} onClick={() => openPanel(p, vehicle)} style={{ cursor: 'pointer' }}>
                {/* 완료 바 */}
                {x1Done !== null && x2Done > x1Done && (
                  <rect x={x1Done} y={y + 12} width={x2Done - x1Done} height={ROW_H - 24}
                    rx={3} fill={catColor} fillOpacity={0.25} />
                )}
                {/* 다음 교환 바 */}
                {x2Next > x1Next && (
                  <rect x={x1Next} y={y + 8} width={x2Next - x1Next} height={ROW_H - 16}
                    rx={3} fill={catColor} fillOpacity={0.7}
                    stroke={catColor} strokeWidth={1} />
                )}
                {/* 미래 바 */}
                {x2Future !== null && x2Future > x1Future && (
                  <rect x={x1Future} y={y + 12} width={x2Future - x1Future} height={ROW_H - 24}
                    rx={3} fill={catColor} fillOpacity={0.15} />
                )}
                {/* 핀 레이블 */}
                {x2Next > 0 && x2Next < totalWidth && (
                  <text x={x2Next + 3} y={y + ROW_H / 2 + 4}
                    fontSize={9} fill={catColor} fillOpacity={0.9}>{pinLabel}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
