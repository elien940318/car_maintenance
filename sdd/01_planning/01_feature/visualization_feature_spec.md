# 시각화 (간트·목록) · Acceptance Criteria (EARS)

> 01_planning: 요구사항을 검증 가능한 EARS로 정제. 이 명세가 가드레일.

## 배경

정비 일정을 두 가지 뷰(간트 차트 / 목록 테이블)로 시각화하고,
항목 클릭 시 부품 상세 사이드 패널을 표시해야 한다.

---

## AC (Acceptance Criteria)

### 공통

**AC-VZ1** The system shall 간트 차트 뷰와 목록 보기 뷰를 탭으로 전환할 수 있어야 한다.

**AC-VZ2** The system shall 정비 항목을 카테고리 섹션으로 그룹화하여 표시한다:
- 엔진·점화·구동계
- 필터 & 공기
- 변속기
- 제동 & 타이어
- 냉각 & 하이브리드

### 간트 차트

**AC-VZ3** The system shall 3년 타임라인(월 단위)의 간트 차트를 표시한다.

**AC-VZ4** The system shall 각 정비 항목에 대해 아래 바(bar)를 표시한다:
- **완료 바**: 최근 교환일 ~ 오늘 구간 (낮은 불투명도)
- **다음 교환 바**: 오늘 ~ 다음 교환 예정일 구간
- **미래 바**: 다음 교환 예정일 ~ 그 다음 교환 예정일 구간 (더 낮은 불투명도)

**AC-VZ5** The system shall 오늘 날짜를 수직선(TODAY line)으로 표시한다.

**AC-VZ6** When `isChain=true`인 항목일 때,
the system shall 교환 바 대신 "교체 불필요" 패턴 배너를 표시한다.

**AC-VZ7** The system shall 다음 교환 예정일 핀(날짜 레이블)을 해당 바 위에 표시한다.

### 목록 테이블

**AC-VZ8** The system shall 목록 뷰에서 각 항목에 대해 아래 컬럼을 표시한다:
항목명 / 주기 / 최근 교환 / 다음 교환 예정일 / 예상 km / 상태

**AC-VZ9** The system shall 상태(urgent/soon/ok/chain)를 색상 배지로 표시한다.

### 알림 카드

**AC-VZ10** The system shall urgent 및 soon 상태 항목을 뷰 상단에 카드로 집계 표시하고,
예정일 오름차순으로 정렬한다.

**AC-VZ11** When 알림 카드가 없을 때,
the system shall 알림 영역을 표시하지 않는다.

### 부품 상세 사이드 패널

**AC-VZ12** When 사용자가 정비 항목(간트 바, 목록 행, 알림 카드)을 클릭하면,
the system shall 슬라이드-인 사이드 패널을 열고 아래 정보를 표시한다:
- 부품명 및 서브태그
- 다음 교환 D-day (또는 초과 일수)
- 부품 구조 SVG 일러스트
- 부품 역할 설명
- 교환 통계 (주기 / 다음 교환일 / 예상 km / 남은 날짜)
- 정비 팁

**AC-VZ13** When 사이드 패널 외부(오버레이)를 클릭하거나 닫기 버튼을 누르면,
the system shall 사이드 패널을 닫는다.

**AC-VZ14(화면 parity)** The 간트 차트 화면은 shall 승인된 디자인 스냅샷과 일치한다.

---

## 검증 매핑 (초안)

| AC | 테스트 유형 |
|----|------------|
| AC-VZ1 | e2e: 탭 전환 동작 |
| AC-VZ2 | e2e: 섹션 그룹화 표시 |
| AC-VZ3~VZ7 | e2e: 간트 차트 렌더링 |
| AC-VZ8~VZ9 | e2e: 목록 테이블 표시 |
| AC-VZ10~VZ11 | e2e: 알림 카드 표시·정렬 |
| AC-VZ12~VZ13 | e2e: 사이드 패널 개폐 |
| AC-VZ14 | ui parity: 스냅샷 비교 |
