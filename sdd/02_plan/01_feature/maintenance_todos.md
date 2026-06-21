# 정비 일정 관리 — 실행 계획

> 참고: [sdd/01_planning/01_feature/maintenance_schedule_feature_spec.md](../../01_planning/01_feature/maintenance_schedule_feature_spec.md)  
> 상태: 대기 (Phase 1 차량 스키마 완료 후 착수)  
> 마지막 업데이트: 2026-06-14

---

## 범위 (Scope)

| 레이어 | 대상 |
|--------|------|
| DB (Prisma) | MaintenancePartMaster, MaintenanceIntervalPreset, MaintenancePart, MaintenanceRecord 모델 정의 |
| 시드 | 부품 마스터 25개 + 프리셋 약 117개 적재 |
| 도메인 (Nest.js) | ScheduleCalculator (순수 함수), 상태 분류, AlertAggregator |
| API (Nest.js) | MaintenanceModule (CRUD + 교환완료 단건) |
| UI (Next.js) | 교환완료 인라인 입력(부품별 단건), isVehicleSpecific 경고 태그 |

---

## 전제 조건 (Assumptions)

- Phase 1: Vehicle 관련 스키마·시드 완료 (`vehicle_todos.md`)
- ScheduleCalculator는 Nest.js `@Injectable()` 없이 순수 함수 모듈로 작성 (단위 테스트 최우선)
- 교환완료 입력은 패널 내 인라인 처리 (별도 모달 없음, VZ22 연동)
- 프리셋 원본은 수정 불가, 사용자 수정값은 MaintenancePart에만 반영 (AC-M16)

---

## 수락 기준 (AC 매핑)

| AC | 내용 요약 |
|----|---------|
| M1 | 정비 항목 등록: 부품명·카테고리·주기유형(pkm/pmo)·주기값 저장 |
| M2 | isChain=true 항목: 예정일 계산 스킵, "교환 불필요/모니터링" 표시 |
| M3 | pkm과 pmo 동시 입력 불가 (XOR) |
| M4 | 교환 기록 등록 시 즉시 재계산 트리거 |
| M5 | pkm 계산: next_km=lkm+pkm, next_date=today+(next_km-cur_km)/monthly_km×30 |
| M6 | pmo 계산: next_date=ldt+pmo개월, next_km=cur_km+months_diff×monthly_km |
| ~~M7~~ | ~~일괄 교환 기록~~ — **삭제됨 (#15, 2026-06-15). 부품별 단건만** |
| M8 | 상태 분류: urgent(<90일) / soon(90~179일) / ok(180일+) |
| M9 | 예정일 초과(과거) → urgent, 초과 일수 표시 |
| M10 | urgent·soon 항목 예정일 오름차순 알림 집계 |
| M11 | isVehicleSpecific=true → 차량 전용 경고 태그 + 주의사항 표시 |
| M12 | 교환완료 다이얼로그: 날짜(기본=오늘)·km(기본=현재km)·메모 입력 |
| M13 | 교환완료 확인 → MaintenanceRecord 저장 + 상태 즉시 재계산 |
| M14 | 교환완료 후 알림 카드 즉시 갱신 (urgent→ok 전환 시 카드 제거) |
| M15 | 차량 등록 시 제원 조합 프리셋 조회 → MaintenancePart 후보 제안 |
| M16 | 프리셋 주기 수정 시 원본 프리셋 불변, MaintenancePart에만 오버라이드 저장 |

---

## 실행 체크리스트

### Phase 1 — Prisma 스키마 & 시드 (정비 관련 모델)

- [x] `schema.prisma`: MaintenancePartMaster 모델 정의
  - part_key PK, name_ko, category, applicable_fuel_codes, role_description, tip_template, svg_key, sort_order
- [x] `schema.prisma`: MaintenanceIntervalPreset 모델 정의
  - id cuid PK, part_key FK, fuel_type_code FK, transmission_code FK(nullable)
  - interval_km, interval_months (XOR — 앱 레이어에서 검증)
  - is_chain bool, note
  - 유니크 제약: `(part_key, fuel_type_code, transmission_code)`
- [x] `schema.prisma`: MaintenancePart 모델 정의
  - vehicle_id FK, part_key FK(nullable), name, sub_name, category
  - interval_km, interval_months (XOR), is_chain, is_vehicle_specific, tip, svg_key, sort_order
- [x] `schema.prisma`: MaintenanceRecord 모델 정의
  - part_id FK, record_km(nullable), record_date(nullable)
  - 제약: record_km 또는 record_date 중 하나 이상 필수 (서비스 레이어 검증)
- [x] 마이그레이션 실행: `20260621103133_init` 완료 (차량·정비 모델 통합)
- [x] `seed.ts`: MaintenancePartMaster 25개 부품 적재 (`code_and_presets.md` 기준)
- [x] `seed.ts`: MaintenanceIntervalPreset 117개 프리셋 적재 (연료×변속기 조합별)
  - NX4 HEV (hev + at / e_motor) 프리셋 포함

### Phase 2 — Nest.js 도메인 & API

#### ScheduleCalculator (순수 도메인 함수)

- [x] `src/schedule/schedule-calculator.ts` 작성
  - [x] adjustCurrentKm / resolveBaseline / calcPkmNextKm / calcPkmNextDate / calcPmoNextDate / calcPmoNextKm / classifyStatus / computePartSchedule 전체 구현
- [x] ScheduleCalculator 단위 테스트 22개 — Jest PASS (AC-M2·M5·M6·M8·M9 커버)

#### AlertAggregator

- [x] `src/schedule/alert-aggregator.ts` — urgent/soon 항목 nextDate 오름차순 반환 (AC-M10)

#### MaintenanceModule

- [x] `src/maintenance/maintenance.module.ts`
- [x] `MaintenanceController`: GET /parts, POST /parts, PATCH /parts/:id, POST /parts/:id/records
- [x] `MaintenanceService`: findByVehicle, createPart, updatePart, createRecord, validateXOR, validateRecord, interpolateRecord
- [x] `CreateMaintenancePartDto`: @ValidateIf XOR 검증 (AC-M3)
- [x] `UpdateMaintenancePartDto`: PartialType
- [x] `RecordCompletionDto`: record_km, record_date optional (서비스 레이어 하나 필수 검증)

### Phase 3 — Next.js UI

- [ ] **isVehicleSpecific 경고 태그** (AC-M11)
  - 카드/패널에 `[NX4]` 등 태그 + 주의사항 텍스트 표시
- [ ] **교환완료 인라인 입력** (AC-M12, M13) — 패널 내 하단 고정
  - 날짜 DatePicker (기본값: 오늘)
  - 주행거리 NumberInput (기본값: 차량 current_km)
  - 메모 TextInput (선택)
  - 저장 버튼 → `POST /records` → 상태 즉시 갱신 (TanStack Query invalidate)

---

## 현재 작업 메모 (Current Notes)

- **Phase 1 완료 (2026-06-21)**: schema.prisma 9개 엔티티 정의, 마이그레이션, seed.ts 적재(부품 25개+프리셋 117개), PrismaModule 등록.
- ScheduleCalculator는 외부 의존성 없는 순수 함수 — 단위 테스트를 코드보다 먼저 작성(TDD).
- **[확정 2026-06-15] 기준일 정책**: `today = new Date()`(실제 오늘)와 `reference_date`(주행거리 기준일)를 분리. current_km는 reference_date 시점 값이므로 `current_km_today`로 보정 후 계산. (#5)
- **[확정 2026-06-15] 이력 0건**: 교환 이력 없으면 등록 시점(reference_date·current_km)을 가상 최초 교환점으로 폴백, `baseline='estimated'` 표기. (#6)
- **[확정 2026-06-15] 계산 불가**: monthly_km<1이면 status='unknown'. DTO에서 annual_km≥1 1차 차단 + 계산 레이어 2차 가드. (#8)
- **[확정 2026-06-15] 일괄 교환(AC-M7) 삭제**: 교환은 부품별 단건 기록만. bulk 엔드포인트·DTO·UI·SCR-04 모두 제외. (#15)

---

## 검증 (Validation)

| AC | 레이어 | 검증 방법 |
|----|--------|---------|
| M1 | unit | CreateMaintenancePart 유효성 검사 테스트 |
| M2 | unit | isChain=true → computePartSchedule() → status='chain', nextDate=null |
| M3 | unit | interval_km+interval_months 동시 입력 → BadRequestException |
| M4 | unit | createRecord() 호출 후 반환 status 변경 확인 |
| M5 | unit | pkm: lkm=89485, pkm=7500, cur=89660, mon=750 → next_km=96985 |
| M6 | unit | pmo: ldt=2026-06-07, pmo=6 → next_date=2026-12-07 |
| ~~M7~~ | — | **삭제됨 (#15)** |
| M8 | unit | 경계값 테스트: days=89→urgent, 90→soon, 179→soon, 180→ok |
| M9 | unit | days=-1 → urgent, daysRemaining < 0 |
| M10 | unit | aggregateAlerts() 결과 예정일 오름차순 정렬 확인 |
| M11 | e2e | Playwright: isVehicleSpecific=true 항목 경고 태그 렌더링 확인 |
| M12 | e2e | Playwright: 교환완료 입력 기본값 (날짜=오늘, km=현재km) |
| M13 | unit + e2e | createRecord() 후 MaintenanceRecord 생성 + status 재계산 일치 |
| M14 | e2e | Playwright: urgent→ok 전환 시 알림 카드 즉시 제거 확인 |
| M15 | unit | PresetService.query(fuelCode='ev') → engine_oil 미포함 |
| M16 | unit | Part interval_km 수정 후 Preset 원본 값 불변 확인 |
