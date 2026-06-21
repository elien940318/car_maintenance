---
name: project-state
description: "carmaint 프로젝트 현재 단계, 확정 결정 사항, 다음 작업 — 세션 간 컨텍스트 유지용"
metadata: 
  node_type: memory
  type: project
  originSessionId: 224195db-0d16-4983-b8d0-e671986b1187
---

## 현재 단계

**03_build Phase 1 완료 → Phase 2(Nest.js API) 착수 대기** (2026-06-21 기준)

전체 현황 문서: `sdd/PROJECT_STATUS.md`

**Why:** 이 파일이 없으면 다음 세션에서 이전 대화 내용 없이 프로젝트 상태를 파악하는 데 시간이 소요됨.
**How to apply:** 세션 시작 시 `sdd/PROJECT_STATUS.md`를 먼저 읽어 컨텍스트를 복원할 것.

---

## 확정 기술 스택

- 프론트: Next.js 14 (App Router) + shadcn/ui + Tailwind + Zustand + TanStack Query + React Hook Form
- 백엔드: Nest.js 10+ + **Prisma 5** (SQLite DEV, PostgreSQL 이식 가능)
  - Prisma 7은 SQLite에서 드라이버 어댑터를 강제하므로 5로 고정. `prisma-client-js` 제너레이터 사용.
- 패키지: pnpm workspace 모노레포 (`apps/web`, `apps/api`)
- 테스트: Jest(Nest.js) + Vitest(Next.js) + Playwright(E2E)
- 배포: Docker Compose (DEV)

상세: `sdd/01_planning/03_architecture/tech_stack.md`

---

## 열린 결정 (OD) — 전체 확정

- OD-1: 기술 스택 = Next.js + Nest.js + Prisma 5 + SQLite
- OD-2: 차량 1대 고정, 다중 차량 불가. 사용자·차량 1:1
- OD-3: MVP 인증 없음
- OD-4: SVG = `public/part-{category}-{slug}.svg` 정적 파일
- OD-5: 프리셋 = Prisma seed.ts에 전체 연료×변속기 조합 117개(NX4 HEV 17개 포함)

---

## 정합성 결정 로그 (2026-06-15)

- **#1** 차량 신규 필드: model_name·license_plate 추가, 제조사=ManufacturerCode 코드테이블(국산6+기타), engine_code 삭제
- **#5/#6/#8** ScheduleCalculator: today(실제오늘)와 reference_date(주행거리 기준일) 분리·current_km 보정 / 이력0건은 등록시점 폴백(baseline='estimated') / monthly_km<1이면 status='unknown'
- **#7** record 누락 축 저장 시 보간(is_estimated_* 플래그)
- **#10** 프리셋 시드 전체 117개 (코드 테이블별 총합)
- **#11** 부품 적용 필터 단일 진실원 = MaintenancePartMaster.applicable_fuel_codes
- **#14** API 타입 앱별 독립 정의 (packages/types 미사용)
- **#15** AC-M7 일괄 교환 삭제 → 부품별 단건만. SCR-04 폐기. (번호는 유지+삭제 표기)

---

## AC 총계

- Vehicle: V1~V10 (10개)
- Maintenance: M1~M16 중 M7 삭제 (15개)
- Visualization: VZ1~VZ23 (23개)
- **합계: 48개**

---

## 데이터 모델 핵심 (엔티티 9개)

- 코드 테이블 4개: VehicleTypeCode(10) / FuelTypeCode(6) / TransmissionTypeCode(6) / ManufacturerCode(7)
- 부품 마스터: MaintenancePartMaster (25개 부품)
- 부품 카테고리 8종: engine·chain·filter·trans·brake·cooling·hybrid·suspension
- 프리셋: MaintenanceIntervalPreset (117개, 연료×변속기 조합별) — id는 `cuid()`
- 트랜잭션: Vehicle → MaintenancePart → MaintenanceRecord — 모두 `cuid()` PK
- 시드 데이터: `sdd/99_toolchain/seed_data/code_and_presets.md`

---

## UI 핵심 결정

- 모바일 (< 640px): 티켓 카드 목록 단일 뷰 (간트 없음, 알림 카드 없음)
- 티켓 카드 상태색: urgent=rose / soon=amber / ok=green / chain=cyan / unknown=muted — **테두리(stroke)+부품명 텍스트 색**(배경 tint 미사용) [[feedback-ui-design]]
- 헤더에서 "최근 교환 요약 배지" 제거됨
- 교환완료 입력: 사이드 패널/바텀 시트 하단 인라인 (부품별 단건, 별도 모달·일괄 없음)
- 태블릿+ (≥ 640px): 간트차트/테이블 탭 + 알림 카드 유지
- 주요 화면: SCR-01 메인 대시보드 / SCR-02 부품 상세 패널 / SCR-03 차량 등록·수정(4단계). SCR-04 폐기

---

## Phase 0 완료 (2026-06-15)

- pnpm workspace 모노레포 구성 완료
- Next.js 14 (App Router + Tailwind): `apps/web/` — 빌드 통과
- Nest.js 10 (strict TS): `apps/api/` — 빌드 통과
- Node.js v24.16.0 portable: `C:\Users\Metanet\tools\nodejs` (PATH 등록)
- pnpm 11.7.0 (corepack)

---

## Phase 1 완료 (2026-06-21)

- schema.prisma: 9개 엔티티 정의 (`apps/api/prisma/schema.prisma`)
- 마이그레이션: `20260621103133_init` SQLite 적용 완료
- seed.ts: 코드 테이블 4종 + 부품마스터 25개 + 프리셋 117개 적재
  - `__dirname` 기반 절대경로로 실행 디렉터리 무관하게 동작
  - SQLite Prisma 5는 `skipDuplicates` 미지원 → 재실행 시 `prisma migrate reset --force` 필요
- PrismaService / PrismaModule: `@Global()` DI 등록, AppModule imports 포함
- Nest.js 빌드 통과 (`dist/src/main.js`)
- prisma.config.ts 삭제 (Prisma 7 전용 파일, Prisma 5 불필요)

---

## 다음 세션 작업: Phase 2 — Nest.js API

1. VehicleModule (VehicleController / VehicleService / DTO)
   - `GET /vehicle`, `POST /vehicle`, `PATCH /vehicle/:id`
   - 차량 1대 제한, monthly_km 자동 계산
2. ScheduleCalculator (순수 도메인 함수, TDD)
3. MaintenanceModule (MaintenanceController / MaintenanceService / DTO)
   - `GET /vehicles/:id/parts`, `POST .../records`
   - 누락 축 보간(interpolateRecord), XOR 검증
4. PresetModule — `GET /presets?fuelCode=&transCode=`

상세: `sdd/02_plan/01_feature/vehicle_todos.md`, `maintenance_todos.md`

[[user-background]]
