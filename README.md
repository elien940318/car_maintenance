# carmaint

자동차 부품별 정비 일정관리 서비스 (토이 프로젝트).

차량 제원(연료·변속기·차종)과 연간 주행거리를 입력하면 부품별 교환 주기 프리셋을 제안하고,
다음 교환 예정일을 자동 계산해 **티켓 카드(모바일) / 간트 차트(태블릿+)** 로 시각화한다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14 (App Router) + shadcn/ui + Tailwind CSS |
| 상태 관리 | Zustand (클라이언트) + TanStack Query (서버) |
| 백엔드 | Nest.js |
| ORM / DB | Prisma + SQLite (DEV) |
| 언어 | TypeScript (프론트·백 공통) |
| 패키지 | pnpm workspace (모노레포) |
| 테스트 | Jest + Vitest + Playwright |

---

## 프로젝트 구조

```
carmaint/
├── apps/
│   ├── web/          # Next.js 14 (App Router + Tailwind + shadcn/ui)
│   │   ├── app/      # layout, page, vehicle/new, vehicle/edit
│   │   ├── components/
│   │   │   ├── dashboard/   # Dashboard, TicketCard, TicketCardList, GanttChart, PartTable, AlertCards
│   │   │   ├── panel/       # PartDetailPanel, PartDetailSheet, PartDetailContent, RecordCompletionForm
│   │   │   └── vehicle/     # VehicleForm, Step1~4, StepIndicator
│   │   ├── lib/      # api.ts, types.ts, codes.ts
│   │   └── store/    # panelStore.ts (Zustand)
│   └── api/          # Nest.js + Prisma
│       ├── src/
│       │   ├── vehicle/     # VehicleModule (GET/POST/PATCH /vehicle)
│       │   ├── preset/      # PresetModule (GET /presets)
│       │   ├── maintenance/ # MaintenanceModule (/vehicles/:id/parts)
│       │   ├── schedule/    # ScheduleCalculator (순수 함수) + AlertAggregator
│       │   └── prisma/      # PrismaModule (Global) + PrismaService
│       └── prisma/   # schema.prisma (9 entities) + seed.ts + dev.db
├── packages/         # 공유 타입 패키지 (미사용 — web·api 각자 타입 정의)
└── sdd/              # Software Delivery Documentation
    ├── PROJECT_STATUS.md        ← 전체 현황 요약
    ├── 00_sources/              # 원본 요구사항
    ├── 01_planning/             # 기능·화면·아키텍처·데이터·테스트 명세 ✅
    ├── 02_plan/                 # 실행 계획 ✅
    ├── 03_build/                # 구현 현황 ✅
    ├── 04_verify/               # 검증 현황 (착수 대기)
    ├── 05_operate/              # 운영 기록
    └── 99_toolchain/
        └── seed_data/           # 코드 마스터 + 정비 주기 프리셋 데이터
```

---

## DEV 실행

```bash
# 루트에서 API + Next.js 동시 기동
pnpm dev

# 개별 실행
pnpm --filter api dev   # http://localhost:3001
pnpm --filter web dev   # http://localhost:3000
```

> 최초 실행 전: `apps/api/` 에서 `pnpm prisma migrate dev` + `pnpm prisma db seed`

---

## 주요 기능

- **차량 등록**: 차종·연료·변속기·연간 주행거리 입력 → 정비 주기 프리셋 자동 제안
- **정비 일정 계산**: km 기반(pkm) / 개월 기반(pmo) 교환 주기, 다음 예정일·상태 자동 산출
- **상태 분류**: urgent(90일 미만) / soon(90~179일) / ok(180일+) / chain(교환 불필요) / unknown(계산 불가)
- **모바일 뷰**: 긴급도 순 티켓 카드 목록 (urgent 초과 일수 많은 순 → chain 최하단), 상태별 색상(🔴🟡🟢), 바텀 시트 상세
- **태블릿+ 뷰**: 간트 차트(3년 타임라인) / 목록 테이블 탭 전환 + 알림 카드
- **교환완료 기록**: 패널·시트 내 인라인 날짜·km 입력

---

## 개발 현황

- **01_planning**: ✅ 완료 — AC 48개 확정 (V10 + M15[M7 삭제] + VZ23)
- **02_plan**: ✅ 완료 — 기능별 실행 계획·회귀 검증 범위 작성
- **03_build**: ✅ 완료 — Phase 0(골격)·1(DB/API 기반)·2(Nest.js API)·3(Next.js UI) 전체 구현
- **04_verify**: 🔲 미착수 — Playwright E2E 검증 예정

> 전체 현황: [`sdd/PROJECT_STATUS.md`](sdd/PROJECT_STATUS.md)

---

## 참고 자료

- 프로토타입: `D:\prj\hybrid_schedule_v2.html` (투싼 NX4 HEV 정비 일정 시각화)
- 명세 인덱스: [`sdd/01_planning/INDEX.md`](sdd/01_planning/INDEX.md)
- 시드 데이터: [`sdd/99_toolchain/seed_data/code_and_presets.md`](sdd/99_toolchain/seed_data/code_and_presets.md)
