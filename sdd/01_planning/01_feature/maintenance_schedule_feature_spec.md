# 정비 일정 관리 · Acceptance Criteria (EARS)

> 01_planning: 요구사항을 검증 가능한 EARS로 정제. 이 명세가 가드레일.

## 배경

차량마다 부품별로 교환 주기(km 또는 개월)를 설정하고, 최근 교환 기록을 입력하면
다음 교환 예정일·예상 km·상태(urgent/soon/ok)를 자동 계산해야 한다.

---

## 용어 정의

| 용어 | 설명 |
|------|------|
| `pkm` | km 기반 교환 주기. 다음 교환 km = 최근 교환 km + pkm |
| `pmo` | 개월 기반 교환 주기. 다음 교환일 = 최근 교환일 + pmo 개월 |
| `lkm` | 최근 교환 주행거리 |
| `ldt` | 최근 교환 날짜 |
| `last_record` | `record_date DESC`, `created_at DESC` 기준 최신 1건의 `MaintenanceRecord`. 동일 날짜 다건 시 `created_at` 최신이 기준. |
| `isChain` | 교환 불필요 항목 (상태 모니터링만, 예: 타이밍체인) |
| `isVehicleSpecific` | 특정 차량 모델 전용 주의사항 보유 항목 (예: NX4 HEV) |

---

## AC (Acceptance Criteria)

### 정비 항목 설정

**AC-M1** When 사용자가 정비 항목을 등록하면,
the system shall 부품명·카테고리·주기 유형(pkm 또는 pmo)·주기 값을 저장한다.

**AC-M2** When `isChain=true`인 항목이 등록되면,
the system shall 해당 항목에 대해 다음 교환 예정일 계산을 수행하지 않고
"교환 불필요 / 상태 모니터링" 으로 표시한다.

**AC-M3** The system shall 한 항목에 pkm과 pmo를 동시에 허용하지 않는다.
(주기 유형은 둘 중 하나만 선택)

### 최근 교환 기록

**AC-M4** When 사용자가 최근 교환 기록을 등록하면,
the system shall `lkm` 또는 `ldt`를 저장하고 다음 교환 예정을 즉시 재계산한다.

**AC-M5** When `pkm` 항목에 `lkm`을 입력하면,
the system shall `next_km = lkm + pkm`으로 계산하고,
`next_date = today + (next_km - current_km) / monthly_km × 30일`로 환산한다.

**AC-M6** When `pmo` 항목에 `ldt`를 입력하면,
the system shall `next_date = ldt + pmo 개월`로 계산하고,
`next_km = current_km + months_diff(today, next_date) × monthly_km`으로 환산한다.

**AC-M7** When 여러 항목을 동시에 교환했을 때,
the system shall 일괄 교환 기록 기능을 통해 선택한 항목 전체의 `ldt`와 `lkm`을 한 번에 업데이트한다.

### 상태 분류

**AC-M8** The system shall 각 항목의 다음 교환 예정일 기준으로 상태를 분류한다:
- `urgent`: 예정일까지 90일 미만
- `soon`: 예정일까지 90일 이상 180일 미만
- `ok`: 예정일까지 180일 이상

**AC-M9** When 다음 교환 예정일이 오늘보다 과거일 때,
the system shall 해당 항목을 `urgent`로 분류하고 초과 일수를 표시한다.

**AC-M10** The system shall urgent 및 soon 항목을 우선순위 순(예정일 오름차순)으로
알림 카드로 집계해 제공한다.

### 특수 케이스

**AC-M11** When `isVehicleSpecific=true`인 항목이 있을 때,
the system shall 해당 항목에 차량 모델 전용 경고 태그와 추가 주의사항을 표시한다.

### 프리셋 기반 항목 제안

**AC-M15** When 차량 등록 시 연료·변속기 코드가 확정되면,
the system shall `MaintenanceIntervalPreset`에서 해당 조합과 일치하는 항목을 조회하여
`MaintenancePart` 후보 목록으로 제안한다.
- 쿼리 조건: `fuel_type_code = 선택값 AND (transmission_code IS NULL OR transmission_code = 선택값)`
- 각 항목의 interval_km / interval_months / is_chain을 기본값으로 표시

**AC-M16** When 사용자가 프리셋 항목의 주기를 수정하면,
the system shall 수정된 값을 해당 `MaintenancePart`의 interval_km 또는 interval_months에 저장한다.
- 원본 프리셋 값은 변경하지 않는다 (개인화 오버라이드).

### 교환완료 처리

**AC-M12** When 사용자가 "교환완료" 액션을 실행하면,
the system shall 교환완료 확인 다이얼로그를 표시하고 아래 항목을 입력받는다:
- 교환 날짜 (기본값: 오늘 날짜)
- 교환 시 주행거리 (기본값: 차량의 현재 km)
- 메모 (선택)

**AC-M13** When 사용자가 교환완료 확인 다이얼로그를 확인하면,
the system shall 입력된 날짜·km·메모를 `MaintenanceRecord`로 저장하고
해당 부품의 다음 교환 예정일과 상태를 즉시 재계산한다.

**AC-M14** When 교환완료 처리가 완료되면,
the system shall 해당 부품의 상태를 재계산하여 알림 카드 목록에서 즉시 제거(urgent→ok 전환 시)하거나
남은 일수를 갱신한다.

---

## 열린 결정

- **OD-5**: 차량 모델별 부품 프리셋 (예: "투싼 NX4 HEV" 선택 시 17개 항목 자동 등록) 제공 여부.
- 현재 상태는 수동 등록 방식 기준으로 명세함.

---

## 검증 매핑 (초안)

| AC | 테스트 유형 |
|----|------------|
| AC-M1 | unit: 항목 등록 유효성 |
| AC-M2 | unit: isChain 항목 계산 스킵 |
| AC-M3 | unit: pkm/pmo 동시 입력 거부 |
| AC-M4 | unit: 교환 기록 저장 및 재계산 트리거 |
| AC-M5 | unit: pkm 계산 정확성 |
| AC-M6 | unit: pmo 계산 정확성 |
| AC-M7 | unit + e2e: 일괄 교환 기록 |
| AC-M8 | unit: 상태 분류 경계값 |
| AC-M9 | unit: 초과 항목 urgent 처리 |
| AC-M10 | unit: 알림 카드 정렬 |
| AC-M11 | e2e: 차량 전용 경고 표시 |
| AC-M12 | e2e: 교환완료 다이얼로그 (기본값 오늘 날짜·현재 km) |
| AC-M13 | unit + e2e: 교환완료 저장 → 상태 즉시 재계산 |
| AC-M14 | e2e: 교환완료 후 알림 카드 즉시 갱신 |
| AC-M15 | unit: 프리셋 조회 쿼리 정확성 (EV→trans_fluid 제외, diesel→glow_plug 포함 등) |
| AC-M16 | unit: 프리셋 주기 수정 시 원본 프리셋 불변 확인 |
