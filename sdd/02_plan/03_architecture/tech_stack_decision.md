# 기술 스택 셋업 실행 계획

> 참고: [sdd/01_planning/03_architecture/tech_stack.md](../../01_planning/03_architecture/tech_stack.md)  
> 상태: 대기 (개발 착수 시 체크리스트 사용)

---

## Phase 0 — 프로젝트 골격 생성

### 0-1. 모노레포 초기화

```bash
# 프로젝트 루트에서 실행
mkdir apps packages
cd apps

# Next.js 앱 생성 (App Router, TypeScript, Tailwind 선택)
npx create-next-app@latest web --typescript --tailwind --app --no-src-dir

# Nest.js 앱 생성
npx @nestjs/cli new api --package-manager pnpm
```

### 0-2. pnpm workspace 설정

```yaml
# pnpm-workspace.yaml (루트)
packages:
  - 'apps/*'
  - 'packages/*'
```

### 0-3. Prisma 설치 및 초기화

```bash
cd apps/api
pnpm add -D prisma
pnpm add @prisma/client
npx prisma init --datasource-provider sqlite
```

---

## Phase 1 — Prisma 스키마 정의

`apps/api/prisma/schema.prisma`에 엔티티를 정의한다.  
([data_model.md](../../01_planning/04_data/data_model.md) 기준)

- [ ] Vehicle 모델
- [ ] MaintenancePart 모델 (interval_km XOR interval_months 제약)
- [ ] MaintenanceRecord 모델
- [ ] 초기 마이그레이션 실행: `npx prisma migrate dev --name init`
- [ ] seed.ts 작성 (투싼 NX4 HEV 17개 항목)

---

## Phase 2 — Nest.js API 모듈 구성

### Spring Boot 개발자를 위한 모듈 구조 대응표

```
apps/api/src/
├── app.module.ts          ← @SpringBootApplication 역할: 모든 모듈을 여기서 imports[]에 등록
├── prisma/
│   └── prisma.service.ts  ← @Repository 역할: PrismaClient를 @Injectable()로 감싸 DI 제공
├── vehicle/
│   ├── vehicle.module.ts        ← 모듈 단위 캡슐화 (@Module decorator)
│   ├── vehicle.controller.ts    ← @RestController 역할
│   ├── vehicle.service.ts       ← @Service 역할
│   └── dto/
│       ├── create-vehicle.dto.ts  ← @RequestBody DTO + class-validator
│       └── update-vehicle.dto.ts
├── maintenance/
│   ├── maintenance.module.ts
│   ├── maintenance.controller.ts
│   ├── maintenance.service.ts
│   └── dto/
├── schedule/
│   └── schedule-calculator.ts   ← 순수 도메인 함수 (Spring의 static utility 유사)
└── main.ts                      ← SpringApplication.run() 역할
```

### 구현 체크리스트

- [ ] PrismaService 작성 및 AppModule 등록
- [ ] VehicleModule: Controller / Service / DTO
- [ ] MaintenanceModule: Controller / Service / DTO
- [ ] ScheduleCalculator: pkm/pmo 계산 순수 함수 (단위 테스트 우선)
- [ ] AlertAggregator: urgent/soon 집계 서비스
- [ ] class-validator 전역 ValidationPipe 설정

---

## Phase 3 — Next.js UI 구성

### App Router 파일 구조

```
apps/web/app/
├── layout.tsx           ← 공통 레이아웃 (헤더 포함)
├── page.tsx             ← 메인 페이지 (간트/목록 탭)
├── vehicle/
│   ├── page.tsx         ← 차량 정보 화면
│   └── edit/page.tsx    ← 차량 정보 수정
└── maintenance/
    ├── page.tsx         ← 정비 항목 목록
    └── [partId]/page.tsx ← 부품 상세 (사이드 패널)

apps/web/components/
├── GanttChart.tsx       ← 간트 차트 (3년 타임라인)
├── MaintenanceTable.tsx ← 목록 뷰 테이블
├── AlertCard.tsx        ← urgent/soon 알림 카드
└── PartDetailPanel.tsx  ← 부품 상세 슬라이드 패널
```

### 구현 체크리스트

- [ ] Nest.js API 호출 클라이언트 (`lib/api.ts`)
- [ ] 차량 정보 페이지 (AC-V1~V4)
- [ ] 정비 항목 목록 + 상태 배지
- [ ] AlertCard 컴포넌트 (urgent/soon 필터)
- [ ] 간트 차트 컴포넌트 (3년 타임라인)
- [ ] PartDetailPanel (SVG 연동)

---

## Phase 4 — 테스트

- [ ] Nest.js: ScheduleCalculator 단위 테스트 (Jest, AC-M5, M6, M8, M9)
- [ ] Nest.js: Vehicle API e2e 테스트 (Supertest)
- [ ] Next.js: AlertCard 컴포넌트 테스트 (Vitest + Testing Library)

---

## 개발 환경 실행 명령

```bash
# 루트에서
pnpm --filter web dev      # Next.js DEV 서버 (localhost:3000)
pnpm --filter api start:dev  # Nest.js DEV 서버 (localhost:3001)
```
