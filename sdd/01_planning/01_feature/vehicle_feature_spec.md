# 차량 등록·관리 · Acceptance Criteria (EARS)

> 01_planning: 요구사항을 검증 가능한 EARS로 정제. 이 명세가 가드레일.

## 배경

사용자는 자신이 보유한 차량의 기본 정보(차종, 연식, 현재 주행거리, 월 평균 주행거리)를
등록하고, 이를 기반으로 정비 일정이 자동 계산되어야 한다.

---

## AC (Acceptance Criteria)

### 차량 기본 정보 등록

**AC-V1** When 사용자가 차량을 등록하면,
the system shall 아래 항목을 저장하고 이를 정비 일정 계산의 기준값으로 사용한다:
- 차량명 (자유 입력)
- 연식
- 차종 코드 (VehicleTypeCode: 경차·소형·준중형·중형·대형·소형SUV·중형SUV·대형SUV·미니밴·픽업)
- 연료 코드 (FuelTypeCode: 가솔린·디젤·LPG·HEV·PHEV·EV)
- 변속기 코드 (TransmissionTypeCode: AT·MT·DCT습식·DCT건식·CVT·전기모터)
- 현재 주행거리 (km)
- 연간 주행거리 (km/년) — 월 평균은 `annual_km / 12`로 자동 계산

**AC-V6** The system shall 차량 등록 폼에서 차종·연료·변속기를 각각 코드 목록으로 제공하고,
사용자가 선택 완료 시 해당 제원 조합에 맞는 정비 주기 프리셋을 조회한다.

**AC-V7** When 차량 제원(연료·변속기) 선택이 완료되면,
the system shall `MaintenanceIntervalPreset`에서 해당 조합과 일치하는 정비 항목 목록을 제안한다.
- 해당 연료 타입에 적용 불가한 부품은 목록에서 제외한다 (예: EV → 엔진오일 없음)
- 적용 가능한 부품은 기본 선택 상태로 표시한다

**AC-V8** When 프리셋 제안 목록이 표시되면,
the system shall 사용자가 각 항목에 대해 수락·주기 수정·제외를 선택할 수 있다.
- 확정된 항목만 해당 차량의 `MaintenancePart`로 등록된다

**AC-V9** When 연간 주행거리가 입력되면,
the system shall `monthly_km = annual_km / 12` (소수점 이하 반올림)로 계산하여
모든 km 기반 정비 예정일 산출에 사용한다.

**AC-V2** When 사용자가 현재 주행거리를 수정하면,
the system shall 변경된 주행거리를 즉시 반영하여 모든 정비 항목의 다음 교환 예정일을 재계산한다.

**AC-V3** When 사용자가 월 평균 주행거리를 수정하면,
the system shall 변경된 월 평균을 즉시 반영하여 km 기반 정비 항목의 예정일을 재계산한다.

**AC-V4** The system shall 차량 정보 화면에서 현재 주행거리·월 평균 주행거리·기준일을
항상 표시한다.

**AC-V5** *(Phase 2 후보)* When 사용자가 두 번째 차량을 등록하면,
the system shall 차량별로 독립된 정비 항목과 이력을 관리한다.

---

## 열린 결정

- **OD-2**: MVP는 단일 차량으로 시작할지 검토 필요. AC-V5는 Phase 2로 분리 가능.
- **OD-3**: 사용자 계정 없이 로컬 스토리지 or 단일 세션 관리 vs. 서버 저장 여부.

---

## 검증 매핑 (초안)

| AC | 테스트 유형 |
|----|------------|
| AC-V1 | unit: 차량 생성 유효성 검사 (코드 필드 포함) |
| AC-V2 | unit: 주행거리 변경 시 일정 재계산 |
| AC-V3 | unit: 연간 km 변경 시 월 평균 재계산 및 예정일 재산출 |
| AC-V4 | e2e: 차량 정보 표시 확인 |
| AC-V5 | unit + e2e: 멀티 차량 격리 (Phase 2) |
| AC-V6 | e2e: 제원 선택 폼 코드 목록 표시 |
| AC-V7 | unit: 제원 조합별 프리셋 조회 정확성 (EV→엔진오일 제외 등) |
| AC-V8 | e2e: 프리셋 항목 수락·수정·제외 동작 |
| AC-V9 | unit: annual_km → monthly_km 계산 정확성 |
