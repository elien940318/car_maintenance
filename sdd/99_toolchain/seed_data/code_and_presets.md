# 코드 마스터 & 정비 주기 프리셋 시드 데이터

> Prisma seed 스크립트(`apps/api/prisma/seed.ts`) 작성의 원천 데이터.
> 모든 값은 국내 제조사 권장 기준을 바탕으로 작성하였으며, 실제 차량 매뉴얼 우선.

---

## 1. VehicleTypeCode (차종 코드)

| code | label_ko | sort_order |
|------|----------|-----------|
| micro | 경차 | 1 |
| compact | 소형 | 2 |
| subcompact | 준중형 | 3 |
| midsize | 중형 | 4 |
| fullsize | 대형 | 5 |
| suv_compact | 소형 SUV | 6 |
| suv_midsize | 중형 SUV | 7 |
| suv_fullsize | 대형 SUV | 8 |
| minivan | 미니밴 | 9 |
| pickup | 픽업트럭 | 10 |

---

## 2. FuelTypeCode (연료 코드)

| code | label_ko | has_engine | has_spark_plug | has_glow_plug | has_dpf | has_hv_battery | sort_order |
|------|----------|-----------|---------------|--------------|---------|---------------|-----------|
| gasoline | 가솔린 | true | true | false | false | false | 1 |
| diesel | 디젤 | true | false | true | true | false | 2 |
| lpg | LPG | true | true | false | false | false | 3 |
| hev | 하이브리드(HEV) | true | true | false | false | true | 4 |
| phev | 플러그인 하이브리드(PHEV) | true | true | false | false | true | 5 |
| ev | 전기(EV) | false | false | false | false | true | 6 |

---

## 3. TransmissionTypeCode (변속기 코드)

| code | label_ko | sort_order |
|------|----------|-----------|
| at | 자동변속기(AT) | 1 |
| mt | 수동변속기(MT) | 2 |
| dct_wet | DCT (습식) | 3 |
| dct_dry | DCT (건식) | 4 |
| cvt | CVT (무단변속기) | 5 |
| e_motor | 전기모터(감속기) | 6 |

---

## 3-1. ManufacturerCode (제조사 코드)

> 국산 브랜드 위주 + `기타`(직접 입력). 수입차는 `기타`로 처리한다. (#1 결정, 2026-06-15)

| code | label_ko | sort_order |
|------|----------|-----------|
| hyundai | 현대 | 1 |
| kia | 기아 | 2 |
| genesis | 제네시스 | 3 |
| kg_mobility | KG모빌리티 | 4 |
| renault_korea | 르노코리아 | 5 |
| chevrolet | 쉐보레(한국GM) | 6 |
| etc | 기타 | 99 |

---

## 4. MaintenancePartMaster (부품 마스터)

| part_key | name_ko | category | applicable_fuel_codes | sort_order |
|----------|---------|----------|-----------------------|-----------|
| engine_oil | 엔진오일 | engine | gasoline,diesel,lpg,hev,phev | 10 |
| oil_filter | 오일필터 | engine | gasoline,diesel,lpg,hev,phev | 20 |
| spark_plug | 스파크플러그 | engine | gasoline,lpg,hev,phev | 30 |
| glow_plug | 글로우플러그 | engine | diesel | 40 |
| serpentine_belt | 구동벨트(보조벨트) | engine | gasoline,diesel,lpg,hev,phev | 50 |
| timing_chain | 타이밍체인 | chain | gasoline,hev,phev | 60 |
| timing_belt | 타이밍벨트 | chain | gasoline,diesel | 70 |
| air_filter | 에어클리너 | filter | gasoline,diesel,lpg,hev,phev | 80 |
| cabin_filter | 에어컨필터 | filter | gasoline,diesel,lpg,hev,phev,ev | 90 |
| fuel_filter | 연료필터(디젤) | filter | diesel | 100 |
| dpf | DPF(매연여과장치) | filter | diesel | 110 |
| trans_fluid | 변속기오일 | trans | gasoline,diesel,lpg,hev,phev | 120 |
| reducer_oil | 감속기오일 | trans | ev | 130 |
| brake_fluid | 브레이크오일 | brake | gasoline,diesel,lpg,hev,phev,ev | 140 |
| brake_pad_front | 브레이크패드(전) | brake | gasoline,diesel,lpg,hev,phev,ev | 150 |
| brake_pad_rear | 브레이크패드(후) | brake | gasoline,diesel,lpg,hev,phev,ev | 160 |
| brake_disc | 브레이크디스크 | brake | gasoline,diesel,lpg,hev,phev,ev | 170 |
| tire | 타이어 | brake | gasoline,diesel,lpg,hev,phev,ev | 180 |
| tire_rotation | 타이어 로테이션 | brake | gasoline,diesel,lpg,hev,phev,ev | 190 |
| coolant | 냉각수 | cooling | gasoline,diesel,lpg,hev,phev | 200 |
| inverter_coolant | 인버터 냉각수 | hybrid | hev,phev,ev | 210 |
| battery_12v | 12V 보조배터리 | hybrid | gasoline,diesel,lpg,hev,phev,ev | 220 |
| hv_battery_check | 고전압배터리 점검 | hybrid | hev,phev,ev | 230 |

---

## 5. MaintenanceIntervalPreset (정비 주기 프리셋)

> 컬럼 설명
> - `fuel`: FuelTypeCode.code
> - `trans`: TransmissionTypeCode.code (NULL = 모든 변속기 공통)
> - `interval_km`: km 기반 교환 주기 (null이면 pmo 방식)
> - `interval_months`: 개월 기반 교환 주기 (null이면 pkm 방식)
> - `is_chain`: 교환 불필요 모니터링 항목
> - `note`: 특이사항

### 5-1. 엔진오일 (engine_oil)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 10000 | NULL | 터보 차량은 7,500km 권장 |
| diesel | NULL | 15000 | NULL | |
| lpg | NULL | 8000 | NULL | |
| hev | NULL | 10000 | NULL | 단거리 위주 시 6개월 시간 기준 병행 권장 |
| phev | NULL | 10000 | NULL | |

### 5-2. 오일필터 (oil_filter)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 10000 | NULL | 엔진오일과 세트 교환 |
| diesel | NULL | 15000 | NULL | 엔진오일과 세트 교환 |
| lpg | NULL | 8000 | NULL | 엔진오일과 세트 교환 |
| hev | NULL | 10000 | NULL | 엔진오일과 세트 교환 |
| phev | NULL | 10000 | NULL | 엔진오일과 세트 교환 |

### 5-3. 스파크플러그 (spark_plug)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 60000 | NULL | 이리듐/백금 기준. 일반 니켈은 20,000km |
| lpg | NULL | 30000 | NULL | LPG 연소 특성상 더 빈번한 교환 |
| hev | NULL | 60000 | NULL | 이리듐 기준 |
| phev | NULL | 60000 | NULL | 이리듐 기준 |

### 5-4. 글로우플러그 (glow_plug)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| diesel | NULL | 100000 | NULL | 시동 불량·백연 발생 시 조기 점검 |

### 5-5. 구동벨트 (serpentine_belt)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 100000 | NULL | 균열·이상음 시 즉시 교환 |
| diesel | NULL | 80000 | NULL | |
| lpg | NULL | 80000 | NULL | |
| hev | NULL | 80000 | NULL | HSG 연결 방식에 따라 부하 상이 |
| phev | NULL | 80000 | NULL | |

### 5-6. 타이밍체인 (timing_chain) — is_chain=true

| fuel | trans | interval_km | interval_months | is_chain | note |
|------|-------|------------|----------------|---------|------|
| gasoline | NULL | NULL | NULL | true | 교환 불필요. 엔진오일 관리가 수명 결정 |
| hev | NULL | NULL | NULL | true | 교환 불필요 |
| phev | NULL | NULL | NULL | true | 교환 불필요 |

### 5-7. 타이밍벨트 (timing_belt)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 100000 | NULL | 벨트 방식 차량만 해당 (제조사 확인 필수) |
| diesel | NULL | 100000 | NULL | 일부 구형 디젤 해당 |

### 5-8. 에어클리너 (air_filter)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 40000 | NULL | 황사·미세먼지 심한 지역 30,000km |
| diesel | NULL | 30000 | NULL | 디젤 흡기 오염 더 빠름 |
| lpg | NULL | 40000 | NULL | |
| hev | NULL | 40000 | NULL | |
| phev | NULL | 40000 | NULL | |

### 5-9. 에어컨필터 (cabin_filter)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | NULL | 6 | 봄·가을 연 2회 |
| diesel | NULL | NULL | 6 | |
| lpg | NULL | NULL | 6 | |
| hev | NULL | NULL | 6 | |
| phev | NULL | NULL | 6 | |
| ev | NULL | NULL | 6 | |

### 5-10. 연료필터 (fuel_filter)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| diesel | NULL | 30000 | NULL | 수분 분리기 겸용 시 주행감 저하 전 교환 |

### 5-11. DPF (dpf) — is_chain=true (강제재생 모니터링)

| fuel | trans | interval_km | interval_months | is_chain | note |
|------|-------|------------|----------------|---------|------|
| diesel | NULL | NULL | NULL | true | 강제재생 주기 OBD 모니터링. 200,000km 교환 목표 |

### 5-12. 변속기오일 (trans_fluid) — 변속기 타입별

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | at | 80000 | NULL | 일부 메이커 무교환 표방, 실사용 80K 권장 |
| gasoline | mt | 40000 | NULL | |
| gasoline | dct_wet | 60000 | NULL | |
| gasoline | dct_dry | 40000 | NULL | 건식은 더 빈번 |
| gasoline | cvt | 40000 | NULL | |
| diesel | at | 80000 | NULL | |
| diesel | mt | 40000 | NULL | |
| diesel | dct_wet | 60000 | NULL | |
| diesel | dct_dry | 40000 | NULL | |
| lpg | at | 80000 | NULL | |
| lpg | mt | 40000 | NULL | |
| hev | at | 80000 | NULL | 회생제동으로 변속 충격 적음 |
| phev | at | 80000 | NULL | |
| phev | dct_wet | 60000 | NULL | |

### 5-13. 감속기오일 (reducer_oil)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| ev | e_motor | 120000 | NULL | 제조사 권장. 누유 없으면 무교환 모델도 있음 |

### 5-14. 브레이크오일 (brake_fluid)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | NULL | 24 | DOT 4 기준 2년 |
| diesel | NULL | NULL | 24 | |
| lpg | NULL | NULL | 24 | |
| hev | NULL | NULL | 36 | 회생제동으로 실사용 빈도 낮아 수명 연장 |
| phev | NULL | NULL | 36 | |
| ev | NULL | NULL | 48 | 회생제동이 대부분, 유압 브레이크 사용 최소 |

### 5-15. 브레이크패드(전) (brake_pad_front)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 50000 | NULL | 전륜이 후륜보다 제동 부하 더 큼. 두께 3mm 이하 즉시 교환 |
| diesel | NULL | 50000 | NULL | |
| lpg | NULL | 50000 | NULL | |
| hev | NULL | 80000 | NULL | 회생제동으로 약 1.5~2배 수명 |
| phev | NULL | 80000 | NULL | |
| ev | NULL | 100000 | NULL | 회생제동 비율 최대 |

### 5-16. 브레이크패드(후) (brake_pad_rear)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 70000 | NULL | |
| diesel | NULL | 70000 | NULL | |
| lpg | NULL | 70000 | NULL | |
| hev | NULL | 100000 | NULL | |
| phev | NULL | 100000 | NULL | |
| ev | NULL | 120000 | NULL | |

### 5-17. 브레이크디스크 (brake_disc)

> 전·후 통합 관리. 전륜 기준 주기 적용.

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 120000 | NULL | 두께 기준 점검 병행. 마모 한계 도달 시 즉시 교환 |
| diesel | NULL | 120000 | NULL | |
| lpg | NULL | 120000 | NULL | |
| hev | NULL | 150000 | NULL | 회생제동으로 마모 적음 |
| phev | NULL | 150000 | NULL | |
| ev | NULL | 200000 | NULL | |

### 5-18. 타이어 (tire)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 50000 | NULL | 트레드 1.6mm 이하 즉시 교환 |
| diesel | NULL | 50000 | NULL | |
| lpg | NULL | 50000 | NULL | |
| hev | NULL | 50000 | NULL | |
| phev | NULL | 50000 | NULL | |
| ev | NULL | 40000 | NULL | EV 중량으로 마모 더 빠름 |

### 5-19. 타이어 로테이션 (tire_rotation)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | 10000 | NULL | 얼라이먼트 동시 점검 권장 |
| diesel | NULL | 10000 | NULL | |
| lpg | NULL | 10000 | NULL | |
| hev | NULL | 10000 | NULL | |
| phev | NULL | 10000 | NULL | |
| ev | NULL | 10000 | NULL | |

### 5-20. 냉각수 (coolant)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | NULL | 60 | OAT 장수명 타입 기준 5년 |
| diesel | NULL | NULL | 48 | 일반 LLC 기준 4년 |
| lpg | NULL | NULL | 48 | |
| hev | NULL | NULL | 60 | |
| phev | NULL | NULL | 60 | |

### 5-21. 인버터 냉각수 (inverter_coolant)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| hev | NULL | NULL | 60 | 전용 LLC, 일반 냉각수 혼용 절대 금지 |
| phev | NULL | NULL | 60 | |
| ev | NULL | NULL | 60 | |

### 5-22. 12V 보조배터리 (battery_12v)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| gasoline | NULL | NULL | 60 | |
| diesel | NULL | NULL | 60 | |
| lpg | NULL | NULL | 60 | |
| hev | NULL | NULL | 48 | HEV 특성상 AGM 배터리 열화 빠름 |
| phev | NULL | NULL | 48 | |
| ev | NULL | NULL | 48 | |

### 5-23. 고전압배터리 점검 (hv_battery_check)

| fuel | trans | interval_km | interval_months | note |
|------|-------|------------|----------------|------|
| hev | NULL | 15000 | NULL | SOC 20~80% 유지 권장 |
| phev | NULL | 15000 | NULL | |
| ev | NULL | 15000 | NULL | BMS 진단 병행 |

---

## 집계 통계

| 항목 | 수 |
|------|----|
| 차종 코드 | 10 |
| 연료 코드 | 6 |
| 변속기 코드 | 6 |
| 제조사 코드 | 7 (국산 6 + 기타) |
| 부품 마스터 | 23 |
| 프리셋 레코드 (예상) | 약 88개 (전체 연료×변속기 조합) |
