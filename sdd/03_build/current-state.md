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
│       │   └── main.ts        # dotenv/config 로드 + NestFactory
│       ├── generated/prisma/  # Prisma 5 생성 클라이언트 (git 제외)
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

## 다음 단계: Phase 3 — Next.js UI

상세 계획: `sdd/02_plan/01_feature/vehicle_todos.md`, `maintenance_todos.md` Phase 3  
화면 명세: `sdd/01_planning/02_screen/screen_spec.md`
