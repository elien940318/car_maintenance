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
