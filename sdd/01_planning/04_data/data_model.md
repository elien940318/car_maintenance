# 데이터 모델

> 01_planning/04_data: 엔티티 구조 및 관계 정의.
> Prisma + SQLite 기준. 스키마 파일: `apps/api/prisma/schema.prisma`

---

## 엔티티 관계도

```
VehicleTypeCode ──< Vehicle >── FuelTypeCode
                      │          TransmissionTypeCode
                      │
                  MaintenancePart ──< MaintenanceRecord
                      │
              MaintenancePartMaster
                      │
          MaintenanceIntervalPreset >── FuelTypeCode
                                    >── TransmissionTypeCode (nullable)
```

---

## 코드 테이블 (Code Master)

> 변경이 거의 없는 참조 데이터. 시드 스크립트로 초기 적재.
> 상세 값은 [`sdd/99_toolchain/seed_data/code_and_presets.md`](../../99_toolchain/seed_data/code_and_presets.md) 참고.

### VehicleTypeCode (차종 코드)

| 필드 | 타입 | 설명 |
|------|------|------|
| code | string PK | 예: `suv_midsize` |
| label_ko | string | 예: `중형 SUV` |
| sort_order | int | 화면 정렬 순서 |

코드 목록: `micro` `compact` `subcompact` `midsize` `fullsize` `suv_compact` `suv_midsize` `suv_fullsize` `minivan` `pickup`

### FuelTypeCode (연료 코드)

| 필드 | 타입 | 설명 |
|------|------|------|
| code | string PK | 예: `hev` |
| label_ko | string | 예: `하이브리드(HEV)` |
| has_engine | bool | 내연기관 여부 (false=EV) |
| has_spark_plug | bool | 스파크플러그 적용 여부 |
| has_glow_plug | bool | 글로우플러그 적용 여부 (diesel only) |
| has_dpf | bool | DPF 적용 여부 (diesel only) |
| has_hv_battery | bool | 고전압배터리 적용 여부 (HEV/PHEV/EV) |
| sort_order | int | |

코드 목록: `gasoline` `diesel` `lpg` `hev` `phev` `ev`

### TransmissionTypeCode (변속기 코드)

| 필드 | 타입 | 설명 |
|------|------|------|
| code | string PK | 예: `dct_wet` |
| label_ko | string | 예: `DCT(습식)` |
| sort_order | int | |

코드 목록: `at` `mt` `dct_wet` `dct_dry` `cvt` `e_motor`

---

## 부품 마스터 (MaintenancePartMaster)

> 차량 독립적 부품 정의. 연료 타입별 적용 가능 여부를 저장.
> 시드 스크립트로 초기 적재.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| part_key | string PK | ✓ | 고유 식별자 (예: `engine_oil`) |
| name_ko | string | ✓ | 부품명 (예: `엔진오일`) |
| category | string | ✓ | engine/chain/filter/trans/brake/cooling/hybrid |
| applicable_fuel_codes | string | ✓ | 적용 가능 연료 코드 (쉼표 구분, 예: `gasoline,diesel,lpg,hev,phev`) |
| role_description | text | - | 부품 역할 설명 (HTML) |
| tip_template | text | - | 정비 팁 기본 템플릿 |
| svg_key | string | - | SVG 일러스트 식별자 |
| sort_order | int | ✓ | 섹션 내 정렬 순서 |

부품 목록 (23개):

| part_key | name_ko | category | 적용 연료 |
|----------|---------|----------|---------|
| engine_oil | 엔진오일 | engine | gasoline,diesel,lpg,hev,phev |
| oil_filter | 오일필터 | engine | gasoline,diesel,lpg,hev,phev |
| spark_plug | 스파크플러그 | engine | gasoline,lpg,hev,phev |
| glow_plug | 글로우플러그 | engine | diesel |
| serpentine_belt | 구동벨트 | engine | gasoline,diesel,lpg,hev,phev |
| timing_chain | 타이밍체인 | chain | gasoline,hev,phev |
| timing_belt | 타이밍벨트 | chain | gasoline,diesel |
| air_filter | 에어클리너 | filter | gasoline,diesel,lpg,hev,phev |
| cabin_filter | 에어컨필터 | filter | gasoline,diesel,lpg,hev,phev,ev |
| fuel_filter | 연료필터 | filter | diesel |
| dpf | DPF(매연여과장치) | filter | diesel |
| trans_fluid | 변속기오일 | trans | gasoline,diesel,lpg,hev,phev |
| reducer_oil | 감속기오일 | trans | ev |
| brake_fluid | 브레이크오일 | brake | gasoline,diesel,lpg,hev,phev,ev |
| brake_pad_front | 브레이크패드(전) | brake | gasoline,diesel,lpg,hev,phev,ev |
| brake_pad_rear | 브레이크패드(후) | brake | gasoline,diesel,lpg,hev,phev,ev |
| brake_disc_front | 브레이크디스크(전) | brake | gasoline,diesel,lpg,hev,phev,ev |
| tire | 타이어 | brake | gasoline,diesel,lpg,hev,phev,ev |
| tire_rotation | 타이어 로테이션 | brake | gasoline,diesel,lpg,hev,phev,ev |
| coolant | 냉각수 | cooling | gasoline,diesel,lpg,hev,phev |
| inverter_coolant | 인버터 냉각수 | hybrid | hev,phev,ev |
| battery_12v | 12V 보조배터리 | hybrid | gasoline,diesel,lpg,hev,phev,ev |
| hv_battery_check | 고전압배터리 점검 | hybrid | hev,phev,ev |

---

## 정비 주기 프리셋 (MaintenanceIntervalPreset)

> 제원 조합(연료×변속기)별 기본 교환 주기 정의.
> 차량 등록 시 이 테이블에서 해당 조합의 항목을 조회하여 제안한다.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | uuid PK | ✓ | |
| part_key | string FK | ✓ | → MaintenancePartMaster |
| fuel_type_code | string FK | ✓ | → FuelTypeCode |
| transmission_code | string FK | - | → TransmissionTypeCode (null=모든 변속기 공통) |
| interval_km | int | - | km 기반 교환 주기 |
| interval_months | int | - | 개월 기반 교환 주기 |
| is_chain | bool | ✓ | 교환 불필요 여부 (default false) |
| note | string | - | 특이사항 (예: `HEV 회생제동으로 수명 약 2배`) |

제약:
- `interval_km`과 `interval_months`는 동시에 값을 가질 수 없다 (XOR).
- `is_chain=true`이면 둘 다 null.
- `(part_key, fuel_type_code, transmission_code)` 조합은 유일해야 한다.

조회 규칙:
```
WHERE fuel_type_code = :vehicleFuel
  AND (transmission_code IS NULL OR transmission_code = :vehicleTrans)
```

---

## 트랜잭션 엔티티

### Vehicle (차량)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | uuid PK | ✓ | |
| name | string | ✓ | 차량명 (자유 입력, 예: `내 투싼`) |
| model_year | int | - | 연식 |
| engine_code | string | - | 엔진 코드 (예: `G1.6T`) |
| vehicle_type_code | string FK | ✓ | → VehicleTypeCode |
| fuel_type_code | string FK | ✓ | → FuelTypeCode |
| transmission_code | string FK | ✓ | → TransmissionTypeCode |
| current_km | int | ✓ | 현재 주행거리 (km) |
| annual_km | int | ✓ | 연간 주행거리 (km/년) |
| monthly_km | int | ✓ | 월 평균 = annual_km / 12 (저장값, 수동 조정 가능) |
| reference_date | date | ✓ | current_km 측정 기준일 |
| notes | string | - | 메모 |
| created_at | datetime | ✓ | |
| updated_at | datetime | ✓ | |

### MaintenancePart (정비 부품 — 차량별 인스턴스)

> Vehicle에 실제 등록된 부품. 프리셋에서 복사하거나 수동 추가.

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | uuid PK | ✓ | |
| vehicle_id | uuid FK | ✓ | → Vehicle |
| part_key | string FK | - | → MaintenancePartMaster (수동 추가 시 null 가능) |
| name | string | ✓ | 부품명 (프리셋에서 복사 또는 직접 입력) |
| sub_name | string | - | 영문/설명 |
| category | string | ✓ | engine/chain/filter/trans/brake/cooling/hybrid |
| interval_km | int | - | 사용자 확정 주기 (pkm) |
| interval_months | int | - | 사용자 확정 주기 (pmo) |
| is_chain | bool | ✓ | 교환 불필요 여부 (default false) |
| is_vehicle_specific | bool | ✓ | 차량 전용 주의사항 여부 (default false) |
| tip | text | - | 정비 팁 (수동 편집 가능) |
| svg_key | string | - | SVG 식별자 |
| sort_order | int | - | 섹션 내 정렬 순서 |
| created_at | datetime | ✓ | |
| updated_at | datetime | ✓ | |

제약: `interval_km`과 `interval_months`는 XOR. `is_chain=true`이면 둘 다 null.

### MaintenanceRecord (정비 기록)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | uuid PK | ✓ | |
| part_id | uuid FK | ✓ | → MaintenancePart |
| record_km | int | - | 교환 시 주행거리 (lkm) |
| record_date | date | - | 교환 날짜 (ldt) |
| memo | string | - | 메모 |
| created_at | datetime | ✓ | |

제약: `record_km` 또는 `record_date` 중 하나 이상 필수.

---

## 계산 뷰 (Computed / Read Model)

DB에 저장하지 않고 런타임에 계산:

| 필드 | 계산 방식 |
|------|---------|
| next_km | last_record.record_km + part.interval_km |
| next_date | last_record.record_date + part.interval_months (pmo) 또는 km 환산 |
| days_remaining | next_date − today |
| status | urgent(<90) / soon(<180) / ok(180+) / chain |

---

## 부품 카테고리 섹션 매핑

| 카테고리 | 섹션명 | 색상 |
|---------|--------|------|
| engine | 엔진·점화·구동계 | #00e5a0 (mint) |
| chain | 엔진·점화·구동계 | #38bdf8 (cyan) |
| filter | 필터 & 공기 | #fb923c (orange) |
| trans | 변속기 | #a78bfa (purple) |
| brake | 제동 & 타이어 | #f87171 (rose) |
| cooling | 냉각 & 하이브리드 | #fbbf24 (amber) |
| hybrid | 냉각 & 하이브리드 | #38bdf8 (cyan) |

---

## 시드 데이터

코드 마스터 및 프리셋 전체 값:
→ [`sdd/99_toolchain/seed_data/code_and_presets.md`](../../99_toolchain/seed_data/code_and_presets.md)
