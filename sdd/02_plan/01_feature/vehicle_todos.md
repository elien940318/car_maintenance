# 차량 등록·관리 — 실행 계획

> 참고: [sdd/01_planning/01_feature/vehicle_feature_spec.md](../../01_planning/01_feature/vehicle_feature_spec.md)  
> 상태: 대기 (Phase 0 완료 후 착수)  
> 마지막 업데이트: 2026-06-15

---

## 범위 (Scope)

| 레이어 | 대상 |
|--------|------|
| DB (Prisma) | VehicleTypeCode, FuelTypeCode, TransmissionTypeCode, ManufacturerCode, Vehicle 모델 정의 및 마이그레이션 |
| 시드 | 코드 마스터 3개 테이블 적재 (code_and_presets.md 기준) |
| API (Nest.js) | VehicleModule (Controller / Service / DTO), PresetModule (프리셋 조회) |
| UI (Next.js) | SCR-03 (4단계 차량 등록·수정 폼), 빈 상태 화면, 헤더 차량 정보 표시 |

---

## 전제 조건 (Assumptions)

- Phase 0 완료: 모노레포 골격 (`apps/web`, `apps/api`) 및 Prisma 초기화 완료
- MaintenancePartMaster, MaintenanceIntervalPreset 모델은 `maintenance_todos.md`와 함께 Phase 1에서 동시 정의
- 인증 없음 (OD-3): 단일 사용자, 단일 차량 (OD-2)
- 코드 마스터 값은 `sdd/99_toolchain/seed_data/code_and_presets.md` 기준

---

## 수락 기준 (AC 매핑)

| AC | 내용 요약 |
|----|---------|
| V1 | 차량명·연식·차종·연료·변속기·현재km·연간km 저장 |
| V2 | 현재km 변경 시 모든 정비 예정일 즉시 재계산 |
| V3 | 연간km 변경 시 monthly_km 자동 재계산 및 예정일 재산출 |
| V4 | 차량 정보 화면에 current_km·monthly_km·reference_date 항상 표시 |
| V5 | 차량 1대 제한, 재등록 시 수정 화면(SCR-03)으로 이동 |
| V6 | 등록 폼에서 차종·연료·변속기 코드 목록 제공, 선택 완료 시 프리셋 조회 |
| V7 | 제원 조합 일치 프리셋 제안 (부적용 부품 제외, 예: EV→엔진오일 없음) |
| V8 | 프리셋 항목별 수락·주기수정·제외 선택 가능, 확정 항목만 MaintenancePart 등록 |
| V9 | annual_km / 12 반올림 → monthly_km (사용자 직접 입력 불가) |
| V10 | 차량 미등록 시 빈 상태 화면 표시, "차량 등록하기" → SCR-03, 등록 완료 → SCR-01 |

---

## 실행 체크리스트

### Phase 1 — Prisma 스키마 & 시드 (차량 관련 모델)

> 진행 상태 표기: `[ ]` 미착수 / `[→]` 진행 중 / `[x]` 완료

- [x] `schema.prisma`: VehicleTypeCode 모델 정의 (code PK, label_ko, sort_order)
- [x] `schema.prisma`: FuelTypeCode 모델 정의 (code PK, label_ko, 적용 여부 플래그 5개[has_engine·has_spark_plug·has_glow_plug·has_dpf·has_hv_battery], sort_order)
- [x] `schema.prisma`: TransmissionTypeCode 모델 정의 (code PK, label_ko, sort_order)
- [x] `schema.prisma`: ManufacturerCode 모델 정의 (code PK, label_ko, sort_order) — #1 신규 코드테이블
- [x] `schema.prisma`: Vehicle 모델 정의
  - 기본 정보 필드: name(별칭), model_name, license_plate (engine_code는 삭제, #1)
  - `monthly_km`은 DB 저장 필드 (annual_km 변경 시 서비스 레이어에서 갱신)
  - FK: vehicle_type_code, fuel_type_code, transmission_code, manufacturer_code(nullable)
- [x] 마이그레이션 실행: `20260621103133_init` 완료
- [x] `seed.ts`: VehicleTypeCode 10개 값 적재
- [x] `seed.ts`: FuelTypeCode 6개 값 적재
- [x] `seed.ts`: TransmissionTypeCode 6개 값 적재
- [x] `seed.ts`: ManufacturerCode 7개 값 적재 (국산 6 + 기타)

### Phase 2 — Nest.js API

- [x] `PrismaService` 작성 및 `AppModule` imports 등록 (Phase 1 완료)
- [x] `VehicleModule` 생성
  - [x] `VehicleController`: GET /vehicle, POST /vehicle, PATCH /vehicle/:id
  - [x] `VehicleService`: create·findOne·update·calcMonthlyKm
  - [x] `CreateVehicleDto`: class-validator (@Min, @IsString 등)
  - [x] `UpdateVehicleDto`: PartialType(CreateVehicleDto)
- [x] `PresetModule` — GET /presets?fuelCode=&transCode= (AC-V6, V7)
- [x] 전역 ValidationPipe (`main.ts`): whitelist=true, transform=true

### Phase 3 — Next.js UI

- [ ] **빈 상태 화면** (AC-V10)
  - `app/page.tsx`: 차량 API 조회 결과 없으면 EmptyState 컴포넌트 렌더링
  - "차량 등록하기" 버튼 → `/vehicle/new`
  - 등록 완료 후 `/` (SCR-01)로 `router.push()`
- [ ] **헤더 차량 정보 표시** (AC-V4)
  - `components/Header.tsx`: 차량명·current_km·monthly_km·reference_date 표시
- [ ] **SCR-03 — 4단계 차량 등록·수정 폼** (`app/vehicle/new/page.tsx`, `app/vehicle/edit/page.tsx`)
  - Step 1 — 기본 정보: 차량 별칭(자유 입력), 차량 모델명, 차량번호, 제조사(드롭다운), 연식(드롭다운)
  - Step 2 — 제원 선택: 차종(VehicleTypeCode)·연료(FuelTypeCode)·변속기(TransmissionTypeCode) 드롭다운 (AC-V6)
    - 제원 확정 시 HEV·AT 조합 기준 프리셋 17항목 자동 제안 안내 표시
  - Step 3 — 주행 정보: current_km, annual_km 입력(annual_km≥1, #8); monthly_km(÷12) 자동 표시(AC-V9); 주행거리 기준일(reference_date, date picker, 기본=오늘)
  - Step 4 — 프리셋 확인: 제원 요약 칩 + MaintenanceIntervalPreset 제안 목록 (AC-V7, V8)
    - ✓/✕ 상태 표시, 비해당 항목(타이밍벨트 HEV 등)은 비활성 처리
    - "완료 등록" → 확정 항목만 MaintenancePart 생성
  - 기존 차량 있을 때 `/vehicle/new` 진입 시 `/vehicle/edit`로 리다이렉트 (AC-V5)
  - 스텝 인디케이터: 완료 스텝 ✓ + mint 테두리, 현재 스텝 mint 배경
  - React Hook Form `useFormContext` + 스텝별 컴포넌트 분리 구조

---

## 현재 작업 메모 (Current Notes)

- **Phase 1 완료 (2026-06-21)**: schema.prisma 9개 엔티티 정의, 마이그레이션, seed.ts 적재, PrismaModule 등록.
- `monthly_km` 는 DB에 저장하되 사용자 직접 입력 불가 — 서비스 레이어에서 annual_km 변경 시마다 재계산.
- SCR-03 단계는 React Hook Form의 `useFormContext` + 스텝별 컴포넌트 분리 구조로 구현 예정.

---

## 검증 (Validation)

| AC | 레이어 | 검증 방법 |
|----|--------|---------|
| V1 | unit | VehicleService.create() 유효성 + FK 저장 확인 |
| V2 | unit | current_km 변경 후 MaintenancePart 예정일 재계산 여부 |
| V3 | unit | annual_km 변경 → monthly_km = round(annual_km/12) 검증 |
| V4 | e2e | Playwright: 헤더 요소에 km·날짜 값 렌더링 확인 |
| V5 | unit | 차량 중복 등록 시 ConflictException 반환 |
| V6 | e2e | Playwright: 차종·연료·변속기 드롭다운 옵션 전체 목록 확인 |
| V7 | unit | fuelCode=ev → engine_oil 미포함, fuelCode=diesel → glow_plug 포함 |
| V8 | e2e | Playwright: 프리셋 제외 후 MaintenancePart 미생성 확인 |
| V9 | unit | annual_km=15000 → monthly_km=1250 |
| V10 | e2e | Playwright: 차량 없을 때 EmptyState 렌더링, 등록 후 대시보드 이동 |
