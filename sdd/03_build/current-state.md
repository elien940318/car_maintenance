# 03_build — 구현 현황 (current-state)

> 이 문서는 **런타임 조립 상태**를 기록한다. dated narrative는 남기지 않는다.

---

## Phase 0 — 프로젝트 골격

### 완료 항목

| 항목 | 경로 | 상태 |
|------|------|------|
| 모노레포 루트 | `pnpm-workspace.yaml`, `package.json` | ✅ |
| Next.js 14 (App Router) | `apps/web/` | ✅ 빌드 통과 |
| Nest.js 10 (strict TS) | `apps/api/` | ✅ 빌드 통과 |
| Prisma 5 초기화 (SQLite) | `apps/api/prisma/schema.prisma` | ✅ |
| pnpm workspace 의존성 | 루트 `node_modules/` | ✅ |

### 런타임 구성

| 항목 | 값 |
|------|----|
| Node.js | v24.16.0 (portable: `C:\Users\Metanet\tools\nodejs`) |
| pnpm | 11.7.0 (corepack via Node) |
| Next.js | 14.x |
| Nest.js | 10.x |
| Prisma | 5.x |
| DB | SQLite DEV (`apps/api/prisma/dev.db`, git 제외) |

### 파일 구조 (Phase 0 이후)

```text
carmaint/
├── apps/
│   ├── web/                  # Next.js 14 (App Router + Tailwind)
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── api/                  # Nest.js 10 (strict TS)
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   ├── app.service.ts
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma  # 9개 엔티티 정의 (Phase 1 완료)
│       │   ├── seed.ts        # 코드 테이블 4종 + 부품 마스터 25개 + 프리셋 117개
│       │   ├── dev.db         # SQLite DB (git 제외)
│       │   └── migrations/    # 20260621103133_init 적용 완료
│       ├── src/
│       │   ├── prisma/
│       │   │   ├── prisma.module.ts   # @Global() PrismaModule
│       │   │   └── prisma.service.ts  # PrismaClient 래퍼
│       │   ├── app.module.ts  # PrismaModule import 포함
│       │   ├── app.controller.ts
│       │   ├── app.service.ts
│       │   └── main.ts        # dotenv/config 로드 + SQLite 절대경로 보정 + NestFactory + CORS(origin:true) + ValidationPipe
│       ├── .env               # DATABASE_URL=file:./prisma/dev.db (git 제외)
│       └── package.json       # prisma.seed: "tsx prisma/seed.ts"
├── pnpm-workspace.yaml
└── package.json
```

---

## Phase 1 완료 사항

| 항목 | 내용 | 상태 |
|------|------|------|
| schema.prisma 9개 엔티티 | VehicleTypeCode, FuelTypeCode, TransmissionTypeCode, ManufacturerCode, MaintenancePartMaster, MaintenanceIntervalPreset, Vehicle, MaintenancePart, MaintenanceRecord | ✅ |
| 마이그레이션 | `20260621103133_init` — SQLite 전체 DDL 적용 | ✅ |
| seed.ts 적재 | 차종 10 / 연료 6 / 변속기 6 / 제조사 7 / 부품 25 / 프리셋 117 | ✅ |
| PrismaService | `@Injectable()` PrismaClient 래퍼, `onModuleInit`에서 `$connect()` | ✅ |
| PrismaModule | `@Global()` — 모든 모듈에서 import 없이 PrismaService 주입 가능 | ✅ |
| AppModule 등록 | `PrismaModule` imports 추가 완료 | ✅ |
| Nest.js 빌드 | `dist/src/` 컴파일 통과 | ✅ |

---

## Phase 2 완료 사항

| 항목 | 내용 | 상태 |
|------|------|------|
| VehicleModule | VehicleController / VehicleService / CreateVehicleDto / UpdateVehicleDto | ✅ |
| PresetModule | GET /presets?fuelCode=&transCode= (AC-V6, V7, M15) | ✅ |
| 전역 ValidationPipe | whitelist=true, transform=true | ✅ |
| ScheduleCalculator | adjustCurrentKm·resolveBaseline·calcPkm*/calcPmo*·classifyStatus·computePartSchedule (순수 함수) | ✅ |
| ScheduleCalculator 단위 테스트 | 22개 Jest PASS (AC-M2·M5·M6·M8·M9 포함) | ✅ |
| AlertAggregator | urgent/soon 항목 nextDate 오름차순 (AC-M10) | ✅ |
| MaintenanceModule | MaintenanceController / MaintenanceService / 3종 DTO | ✅ |
| MaintenanceService | findByVehicle·createPart·updatePart·createRecord·interpolateRecord·validateXOR·validateRecord | ✅ |

### 파일 구조 (Phase 2 이후)

```text
apps/api/src/
├── prisma/            # PrismaModule (Global) + PrismaService
├── vehicle/           # VehicleModule — GET/POST/PATCH /vehicle
│   ├── dto/           # CreateVehicleDto, UpdateVehicleDto
│   ├── vehicle.controller.ts
│   ├── vehicle.service.ts
│   └── vehicle.module.ts
├── preset/            # PresetModule — GET /presets
│   ├── preset.controller.ts
│   ├── preset.service.ts
│   └── preset.module.ts
├── schedule/          # 순수 도메인 함수 (NestJS 외부)
│   ├── schedule-calculator.ts      # ScheduleCalculator 8개 함수
│   ├── schedule-calculator.spec.ts # Jest 단위 테스트 22개
│   └── alert-aggregator.ts         # AlertAggregator
└── maintenance/       # MaintenanceModule — GET/POST/PATCH /vehicles/:id/parts
    ├── dto/           # CreateMaintenancePartDto, UpdateMaintenancePartDto, RecordCompletionDto
    ├── maintenance.controller.ts
    ├── maintenance.service.ts
    └── maintenance.module.ts
```

---

## Phase 3 완료 사항

| 항목 | 내용 | 상태 |
|------|------|------|
| 디자인 토큰 | globals.css CSS 변수 (--bg·--mint·--rose 등 14종) + Tailwind `cm-*` 색상 확장 | ✅ |
| 의존성 | @tanstack/react-query 5 / zustand 5 / react-hook-form 7 | ✅ |
| lib/types.ts | 프론트엔드 API 응답 타입 (Vehicle, PartWithSchedule, PresetItem 등) | ✅ |
| lib/api.ts | fetch 기반 API 클라이언트 (vehicle·presets·parts 엔드포인트) | ✅ |
| lib/codes.ts | 정적 코드 테이블 (차종·연료·변속기·제조사·카테고리 색상·상태 색상) | ✅ |
| store/panelStore.ts | Zustand 전역 패널 상태 (선택 부품, 열림/닫힘) | ✅ |
| components/providers.tsx | QueryClientProvider 래퍼 (retry: 404 제외) | ✅ |
| app/layout.tsx | 메타데이터 + Providers 주입 | ✅ |
| app/page.tsx | 차량 조회 → 빈 상태 또는 Dashboard 분기 (AC-V10) | ✅ |
| EmptyState.tsx | 차량 미등록 안내 화면 + 등록하기 버튼 (AC-V10) | ✅ |
| Header.tsx | 차량명·연식·연료 태그 + current_km·monthly_km·reference_date (AC-V4) | ✅ |
| SCR-03 차량 폼 | StepIndicator + VehicleForm + Step1~4 (React Hook Form useFormContext) | ✅ |
| vehicle/new/page.tsx | 신규 등록 (기존 차량 있으면 /vehicle/edit 리다이렉트, AC-V5) | ✅ |
| vehicle/edit/page.tsx | 차량 수정 (기존 데이터 pre-populate) | ✅ |
| TicketCard.tsx | 상태별 테두리+텍스트 색 (AC-VZ5), 1행(부품명·D-day·상태), 2행(큰 교환예정일·작은 주기), 카테고리 색 미사용 (AC-VZ4) | ✅ |
| TicketCardList.tsx | 긴급도 순 정렬 단일 플랫 목록 — urgent→soon→ok→unknown→chain, 같은 상태 내 daysRemaining 오름차순 (AC-VZ1·VZ3) | ✅ |
| AlertCards.tsx | urgent/soon 알림 카드, nextDate 오름차순 (AC-VZ9·VZ10) | ✅ |
| GanttChart.tsx | 36개월 SVG 간트 차트, TODAY 라인·자동 스크롤·완료/다음/미래 바 (AC-VZ11~VZ16) | ✅ |
| PartTable.tsx | 목록 테이블 6컬럼 + 상태 배지 (AC-VZ17·VZ18) | ✅ |
| Dashboard.tsx | 640px 반응형 분기 (모바일/태블릿+ 탭), TanStack Query 데이터 패칭 | ✅ |
| PartDetailContent.tsx | 부품 역할·교환 정보 2×2 그리드·정비 팁 (AC-VZ19) | ✅ |
| PartDetailPanel.tsx | 태블릿+ 우측 슬라이드인 사이드 패널 (AC-VZ21·VZ23) | ✅ |
| PartDetailSheet.tsx | 모바일 바텀 시트 75vh (AC-VZ20·VZ23) | ✅ |
| RecordCompletionForm.tsx | 교환완료 인라인 입력 (날짜/km/메모 기본값, POST→invalidate, AC-M12·M13·VZ22) | ✅ |
| Next.js build | TypeScript 컴파일 오류 0개 / 정적 페이지 7개 생성 | ✅ |

### 파일 구조 (Phase 3 이후)

```text
apps/web/
├── app/
│   ├── globals.css           # 디자인 토큰 CSS 변수
│   ├── layout.tsx            # Providers + 메타데이터
│   ├── page.tsx              # 빈 상태 / Dashboard 분기
│   └── vehicle/
│       ├── new/page.tsx      # SCR-03 신규 등록
│       └── edit/page.tsx     # SCR-03 수정
├── components/
│   ├── providers.tsx         # QueryClientProvider
│   ├── EmptyState.tsx
│   ├── Header.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx     # 640px 반응형 분기 오케스트레이터
│   │   ├── TicketCard.tsx
│   │   ├── TicketCardList.tsx
│   │   ├── AlertCards.tsx
│   │   ├── GanttChart.tsx    # SVG 36개월 타임라인
│   │   └── PartTable.tsx
│   ├── panel/
│   │   ├── PartDetailContent.tsx
│   │   ├── PartDetailPanel.tsx   # 태블릿+ 사이드 패널
│   │   ├── PartDetailSheet.tsx   # 모바일 바텀 시트
│   │   └── RecordCompletionForm.tsx
│   └── vehicle/
│       ├── VehicleForm.tsx   # 4단계 폼 래퍼
│       ├── StepIndicator.tsx
│       ├── Step1Basic.tsx
│       ├── Step2Spec.tsx
│       ├── Step3Mileage.tsx
│       └── Step4Preset.tsx
├── lib/
│   ├── types.ts
│   ├── api.ts
│   └── codes.ts
└── store/
    └── panelStore.ts
```

---

## Phase 4 완료 사항

| 항목 | 내용 | 상태 |
|------|------|------|
| Playwright 설치 | `@playwright/test ^1.61.0` 루트 devDependency | ✅ |
| playwright.config.ts | Chromium 기반 3개 프로젝트 (desktop/mobile/tablet), baseURL=http://localhost:3000 | ✅ |
| tests/e2e/helpers.ts | 공통 헬퍼 (ensureVehicleExists, getVehicleId, getFirstPartId) | ✅ |
| tests/e2e/vehicle.spec.ts | AC-V4, V5, V6, V10 E2E 검증 | ✅ |
| tests/e2e/mobile-dashboard.spec.ts | AC-VZ1, VZ3~VZ7 E2E 검증 (390×844) | ✅ |
| tests/e2e/tablet-dashboard.spec.ts | AC-VZ8~VZ10, VZ11~VZ14, VZ17~VZ18 E2E 검증 (810×1080) | ✅ |
| tests/e2e/part-detail.spec.ts | AC-M11, VZ19~VZ21, VZ23 E2E 검증 | ✅ |
| tests/e2e/record-completion.spec.ts | AC-M12, M13, M14, VZ22 E2E 검증 | ✅ |
| E2E 실행 결과 | 75개 중 72 PASS / 3 SKIP / 0 FAIL (2026-06-21) | ✅ |

### 파일 구조 (Phase 4 이후)

```text
carmaint/
├── playwright.config.ts    # Chromium 3-project 설정
└── tests/
    └── e2e/
        ├── helpers.ts
        ├── vehicle.spec.ts
        ├── mobile-dashboard.spec.ts
        ├── tablet-dashboard.spec.ts
        ├── part-detail.spec.ts
        └── record-completion.spec.ts
```
