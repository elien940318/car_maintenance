# 회귀 검증 계획

> 참고: [sdd/01_planning/10_test/test_strategy.md](../../01_planning/10_test/test_strategy.md)  
> 상태: 진행 중 (Phase 3 완료, Playwright E2E 구축 중)  
> 마지막 업데이트: 2026-06-21

---

## 목적

변경 발생 시 영향받는 영역을 체계적으로 식별하고, 재검증해야 할 테스트 범위를 사전에 정의한다.
각 피처 구현 단계에서 이 문서를 참조하여 검증 범위를 결정한다.

---

## 회귀 범위 선택 기준

변경 사항이 발생했을 때 아래 기준에 따라 재검증 범위를 확장한다:

| 변경 영역 | 직접 대상 | 업스트림·다운스트림 영향 |
|---------|---------|----------------------|
| ScheduleCalculator 로직 | unit: M5, M6, M8, M9 | 모든 정비 항목 상태 표시 (VZ5, VZ9) |
| 상태 분류 임계값 (urgent/soon/ok) | unit: M8, M9 | AlertCard 집계 (M10), 티켓 카드 색상 (VZ5) |
| Vehicle.current_km / annual_km | unit: V2, V3, V9 | 전체 정비 예정일 재계산 (M5, M6) |
| MaintenancePart.interval 변경 | unit: M16 | 해당 부품 예정일 + 상태 (M4, M8) |
| MaintenanceRecord 생성 | unit+e2e: M13 | 부품 상태 갱신 (M14), AlertCard 갱신 |
| 프리셋 조회 쿼리 | unit: M15, V7 | 차량 등록 4단계 프리셋 제안 목록 |
| 부품 필터링 (연료·변속기) | unit: VZ2 | TicketCard 목록, 간트 행, 목록 테이블 |
| GanttChart scrollLeft 계산 | e2e: VZ14 | 간트 초기 렌더 스크린샷 (UI Parity) |
| 반응형 분기 (640px) | e2e: VZ3, VZ7, VZ20, VZ21 | 모든 반응형 컴포넌트 |
| PartDetailPanel 오픈·닫기 | e2e: VZ19, VZ23 | BottomSheet(VZ20), SidePanel(VZ21) |
| 교환완료 입력 저장 | unit+e2e: M13, VZ22 | 상태 재계산(M4), 알림 갱신(M14) |

---

## 테스트 레이어별 실행 명령

### Nest.js (apps/api)

```bash
# 단위 테스트 전체
pnpm --filter api test

# 특정 파일만 실행
pnpm --filter api test schedule-calculator

# 커버리지 포함
pnpm --filter api test:cov

# E2E (Supertest)
pnpm --filter api test:e2e
```

### Next.js (apps/web)

```bash
# 단위·컴포넌트 테스트 (Vitest)
pnpm --filter web test

# 커버리지
pnpm --filter web test:coverage
```

### Playwright E2E (루트)

```bash
# 전체 E2E 실행
pnpm exec playwright test

# 특정 파일
pnpm exec playwright test tests/vehicle.spec.ts

# 모바일 뷰포트 고정
pnpm exec playwright test --project=mobile

# UI 모드 (디버그)
pnpm exec playwright test --ui
```

---

## AC → 테스트 전체 매핑

### 차량 (Vehicle)

| AC | 레이어 | 테스트 파일 (예정) | 우선순위 |
|----|--------|-----------------|--------|
| V1 | unit | `vehicle.service.spec.ts` | 🔴 |
| V2 | unit | `vehicle.service.spec.ts` | 🔴 |
| V3 | unit | `vehicle.service.spec.ts` | 🔴 |
| V4 | e2e | `vehicle.spec.ts` | 🟡 |
| V5 | unit | `vehicle.service.spec.ts` | 🔴 |
| V6 | e2e | `vehicle-register.spec.ts` | 🟡 |
| V7 | unit | `preset.service.spec.ts` | 🔴 |
| V8 | e2e | `vehicle-register.spec.ts` | 🟡 |
| V9 | unit | `vehicle.service.spec.ts` | 🔴 |
| V10 | e2e | `empty-state.spec.ts` | 🟡 |

### 정비 일정 (Maintenance)

| AC | 레이어 | 테스트 파일 (예정) | 우선순위 |
|----|--------|-----------------|--------|
| M1 | unit | `maintenance.service.spec.ts` | 🔴 |
| M2 | unit | `schedule-calculator.spec.ts` | 🔴 |
| M3 | unit | `maintenance.service.spec.ts` | 🔴 |
| M4 | unit | `maintenance.service.spec.ts` | 🔴 |
| M5 | unit | `schedule-calculator.spec.ts` | 🔴 |
| M6 | unit | `schedule-calculator.spec.ts` | 🔴 |
| ~~M7~~ | — | **삭제됨 (#15, 2026-06-15)** | — |
| M8 | unit | `schedule-calculator.spec.ts` | 🔴 |
| M9 | unit | `schedule-calculator.spec.ts` | 🔴 |
| M10 | unit | `alert-aggregator.spec.ts` | 🔴 |
| M11 | e2e | `part-detail.spec.ts` | 🟡 |
| M12 | e2e | `record-completion.spec.ts` | 🟡 |
| M13 | unit + e2e | `maintenance.service.spec.ts`, `record-completion.spec.ts` | 🔴 |
| M14 | e2e | `record-completion.spec.ts` | 🟡 |
| M15 | unit | `preset.service.spec.ts` | 🔴 |
| M16 | unit | `maintenance.service.spec.ts` | 🔴 |

### 시각화 (Visualization)

| AC | 레이어 | 테스트 파일 (예정) | 우선순위 |
|----|--------|-----------------|--------|
| VZ1 | e2e | `dashboard.spec.ts` | 🟡 |
| VZ2 | unit | `part-filter.spec.ts` | 🔴 |
| VZ3 | e2e | `mobile-dashboard.spec.ts` (viewport 390×844) | 🟡 |
| VZ4 | e2e | `ticket-card.spec.ts` | 🟡 |
| VZ5 | e2e | `ticket-card.spec.ts` | 🟡 |
| VZ6 | e2e | `ticket-card.spec.ts` | 🟡 |
| VZ7 | e2e | `mobile-dashboard.spec.ts` | 🟡 |
| VZ8 | e2e | `tablet-dashboard.spec.ts` (viewport 768×1024) | 🟡 |
| VZ9 | e2e | `alert-card.spec.ts` | 🟡 |
| VZ10 | e2e | `alert-card.spec.ts` | 🟡 |
| VZ11 | e2e | `gantt.spec.ts` | 🟡 |
| VZ12 | e2e | `gantt.spec.ts` | 🟡 |
| VZ13 | e2e | `gantt.spec.ts` | 🟡 |
| VZ14 | e2e + ui-parity | `gantt.spec.ts` (scrollLeft 검증 + 스냅샷) | 🟡 |
| VZ15 | e2e | `gantt.spec.ts` | 🟡 |
| VZ16 | e2e | `gantt.spec.ts` | 🟡 |
| VZ17 | e2e | `list-table.spec.ts` | 🟡 |
| VZ18 | e2e | `list-table.spec.ts` | 🟡 |
| VZ19 | e2e | `part-detail.spec.ts` | 🟡 |
| VZ20 | e2e | `bottom-sheet.spec.ts` (viewport 390×844) | 🟡 |
| VZ21 | e2e | `side-panel.spec.ts` (viewport 768×1024) | 🟡 |
| VZ22 | e2e | `record-completion.spec.ts` | 🟡 |
| VZ23 | e2e | `panel-close.spec.ts` | 🟡 |

> 🔴 = Phase 2 이전 필수 (도메인 로직 보호) / 🟡 = Phase 3 이후 (UI 완성 후 추가)

---

## 핵심 회귀 케이스 — ScheduleCalculator

> 코드 변경 시 반드시 재실행. 출처: `01_planning/10_test/test_strategy.md`

| 케이스 | 입력 | 기대 출력 |
|--------|------|---------|
| pkm 정상 | lkm=89485, pkm=7500, cur=89660, mon=750 | next_km=96985, status='ok' |
| pmo 정상 | ldt=2026-06-07, pmo=6 | next_date=2026-12-07 |
| isChain | is_chain=true | status='chain', next_km=null, next_date=null |
| 초과 (과거) | next_date=2026-01-01 (오늘보다 과거) | status='urgent', days < 0 |
| 경계값 urgent | days_remaining=45 | status='urgent' |
| 경계값 soon | days_remaining=91 | status='soon' |
| 경계값 ok | days_remaining=181 | status='ok' |
| XOR 위반 | interval_km=7500, interval_months=6 동시 | ValidationError |
| 이력 0건 폴백 | last_km=null, last_date=null | baseline='estimated', 예정일 계산됨 |
| 기준일 보정 | ref < today | current_km_today = current_km + 경과분 |
| monthly_km 0 가드 | monthly_km=0 | status='unknown', next_date=null |

---

## 현재 잔여 위험 (Residual Risk)

| 항목 | 설명 | 해소 시점 |
|------|------|---------|
| GanttChart scrollLeft | 브라우저 렌더링 타이밍에 따라 초기값 불일치 가능 | Phase 3 완료 후 Playwright 검증 |
| BottomSheet 스와이프 | 터치 이벤트 시뮬레이션 한계 (Playwright `touchmove` 지원 제한) | Phase 3 완료 후 실기기 검증 병행 |
| 프리셋 XOR 제약 | Prisma SQLite에서 CHECK 제약 미지원 → 앱 레이어 검증에만 의존 | Phase 1 마이그레이션 후 service 단위 테스트로 보완 |
| UI Parity 기준선 | 간트 스크린샷 기준 이미지 미생성 (Phase 3 완료 후 최초 실행 시 생성) | Phase 3 완료 후 |
