# 04_verify — Phase 1 검증 결과

> 검증 일시: 2026-06-21  
> 대상: Phase 1 (DB 스키마 / 마이그레이션 / 시드 / PrismaModule)

---

## 검증 방법

- `prisma-parity` 에이전트: schema.prisma·seed.ts ↔ data_model.md·code_and_presets.md 대조
- `sdd-consistency` 에이전트: planning(01)·plan(02)·PROJECT_STATUS 교차 정합성 점검

---

## 통과 항목

| 항목 | 결과 |
|------|------|
| schema.prisma 9개 엔티티 존재 | ✅ |
| VehicleTypeCode 10개 / FuelTypeCode 6개 / TransmissionTypeCode 6개 / ManufacturerCode 7개 | ✅ |
| MaintenancePartMaster 25개 (applicable_fuel_codes CSV 포함) | ✅ |
| MaintenanceIntervalPreset 117개 프리셋 (is_chain/interval XOR 준수) | ✅ |
| ManufacturerCode FK nullable 처리 | ✅ |
| MaintenanceIntervalPreset unique (part_key, fuel_type_code, transmission_code) | ✅ |
| engine_code 필드 미존재 (삭제 결정 #1 반영) | ✅ |
| is_estimated_km / is_estimated_date 존재·타입 일치 | ✅ |
| Nest.js 빌드(`dist/src/main.js` 등) 통과 | ✅ |
| AC 총계 48개 문서 간 일치 | ✅ |

---

## 수정된 불일치

| 항목 | 원래 값 | 수정 값 | 위치 |
|------|---------|---------|------|
| serpentine_belt name_ko | `구동벨트` | `구동벨트(보조벨트)` | data_model.md:106 |
| reference_date 타입 | `date` | `datetime` | data_model.md:176 |
| record_date 타입 | `date` | `datetime` | data_model.md:212 |
| MaintenanceIntervalPreset id 타입 | `uuid PK` | `cuid PK` | data_model.md:136 |
| Vehicle id 타입 | `uuid PK` | `cuid PK` | data_model.md:164 |
| MaintenancePart id 타입 | `uuid PK` | `cuid PK` | data_model.md:187 |
| MaintenanceRecord id 타입 | `uuid PK` | `cuid PK` | data_model.md:209 |
| seed.ts 주석 "코드 마스터 7종" | 오류 표현 | "코드 테이블 4종" | seed.ts:3 |
| PROJECT_STATUS.md 현재 단계 | Phase 0 착수 대기 | Phase 1 완료 | PROJECT_STATUS.md:4,15 |
| current-state.md | Phase 1 미착수 기술 | Phase 1 완료 내용으로 갱신 | 03_build/current-state.md |
| vehicle_todos.md Phase 1 체크리스트 | `[ ]` | `[x]` | 02_plan/01_feature/vehicle_todos.md |
| maintenance_todos.md Phase 1 체크리스트 | `[ ]` | `[x]` | 02_plan/01_feature/maintenance_todos.md |
| CLAUDE.md 현재 단계 | Phase 0 착수 대기 | Phase 1 완료 | .claude/CLAUDE.md:47 |
| prisma.config.ts | Prisma 7 전용 파일 존재 | 삭제 (Prisma 5 불필요) | apps/api/prisma.config.ts |

---

## 잔존 리스크 (Phase 2 구현 시 해소 필요)

| 항목 | 내용 | 해소 위치 |
|------|------|---------|
| record_km/record_date XOR 제약 | DB 레이어 CHECK 없음 (SQLite 한계). 둘 다 null 삽입 방지 불가 | Phase 2 CreateRecordDto `@ValidateIf` + service `validateRecord()` |
| interval_km XOR interval_months | DB 레이어 CHECK 없음 | Phase 2 CreateMaintenancePartDto `@ValidateIf` + service `validateXOR()` |
| seed 재실행 불가 | SQLite Prisma 5 `skipDuplicates` 미지원. unique 위반으로 롤백 | `prisma migrate reset --force` 후 재시드 (개발 환경 한정) |

---

## 회귀 범위

Phase 1은 스키마·시드·PrismaModule만 추가. 변경된 런타임 API 엔드포인트 없음.  
Next.js web 앱(`apps/web/`)은 영향 없음.
