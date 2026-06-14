# 데이터 모델

> 01_planning/04_data: 엔티티 구조 및 관계 정의. ORM/SQL 스키마는 기술 스택 결정 후 작성.

---

## 엔티티

### Vehicle (차량)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | uuid | ✓ | 기본키 |
| name | string | ✓ | 차량명 (예: "투싼 NX4 하이브리드") |
| model_year | int | - | 연식 (예: 2021) |
| engine_code | string | - | 엔진 코드 (예: "G1.6T") |
| current_km | int | ✓ | 현재 주행거리 (km) |
| monthly_km | int | ✓ | 월 평균 주행거리 (km) |
| reference_date | date | ✓ | 기준일 (current_km 측정 기준일) |
| notes | string | - | 메모 (예: NX4 HEV ECU 업그레이드 완료 여부) |
| created_at | datetime | ✓ | 생성 시각 |
| updated_at | datetime | ✓ | 수정 시각 |

### MaintenancePart (정비 부품)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | uuid | ✓ | 기본키 |
| vehicle_id | uuid | ✓ | FK → Vehicle |
| name | string | ✓ | 부품명 (예: "엔진오일") |
| sub_name | string | - | 영문/설명 (예: "Engine Oil · G1.6T HEV") |
| category | enum | ✓ | engine/chain/filter/trans/brake/cooling/hybrid |
| interval_km | int | - | km 기반 주기 (pkm) |
| interval_months | int | - | 개월 기반 주기 (pmo) |
| is_chain | bool | ✓ | 교환 불필요 항목 여부 (default false) |
| is_vehicle_specific | bool | ✓ | 차량 전용 주의사항 여부 (default false) |
| role_description | text | - | 부품 역할 설명 (HTML) |
| tip | text | - | 정비 팁 |
| svg_key | string | - | SVG 일러스트 식별자 |
| sort_order | int | - | 섹션 내 정렬 순서 |
| created_at | datetime | ✓ | |
| updated_at | datetime | ✓ | |

제약:
- `interval_km`과 `interval_months`는 동시에 값을 가질 수 없다 (XOR).
- `is_chain=true`이면 `interval_km`, `interval_months` 모두 null.

### MaintenanceRecord (정비 기록)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | uuid | ✓ | 기본키 |
| part_id | uuid | ✓ | FK → MaintenancePart |
| record_km | int | - | 교환 시 주행거리 (lkm) |
| record_date | date | - | 교환 날짜 (ldt) |
| memo | string | - | 메모 (예: "현대 서비스센터") |
| created_at | datetime | ✓ | |

제약:
- `record_km` 또는 `record_date` 중 하나 이상은 반드시 존재.

---

## 계산 뷰 (Computed / Read Model)

DB에 저장하지 않고 런타임에 계산하는 값:

| 필드 | 계산 방식 |
|------|---------|
| next_km | last_record.record_km + part.interval_km |
| next_date | last_record.record_date + part.interval_months (pmo) 또는 km 환산 |
| days_remaining | next_date - today |
| status | days_remaining 기준 urgent/soon/ok/chain |

> `last_record` = 해당 part의 MaintenanceRecord 중 가장 최근 항목.

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

## 시드 데이터 (프로토타입 기반)

투싼 NX4 하이브리드 21년식 기본 정비 항목 17개를 시드로 제공.
`sdd/99_toolchain`에 시드 스크립트 예정.
