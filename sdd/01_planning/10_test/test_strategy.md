# 테스트 전략

> 01_planning/10_test: 테스트 레이어 정의 및 AC 매핑.
> 테스트 도구는 기술 스택(OD-1) 결정 후 확정.

---

## 테스트 레이어

| 레이어 | 대상 | 도구 (TBD) |
|--------|------|-----------|
| Unit | 도메인 로직 (ScheduleCalculator, 상태 분류) | pytest / jest |
| Integration | Repository 어댑터 + DB | pytest / jest |
| E2E | 브라우저 UI 흐름 | Playwright |
| UI Parity | 화면 스냅샷 비교 | Playwright 스냅샷 |

---

## 핵심 단위 테스트 케이스

### ScheduleCalculator

| 케이스 | 입력 | 기대 출력 |
|--------|------|---------|
| pkm 정상 계산 | lkm=89485, pkm=7500, cur=89660, mon=750 | next_km=96985, next_date≈2027-03 |
| pmo 정상 계산 | ldt=2026-06-07, pmo=6 | next_date=2026-12-07 |
| is_chain=true | — | status='chain', next_km=null, next_date=null |
| next_date 과거 | next_date < today | status='urgent', days_remaining < 0 |
| days_remaining 45 | — | status='urgent' |
| days_remaining 91 | — | status='soon' |
| days_remaining 181 | — | status='ok' |
| pkm/pmo 동시 설정 시도 | interval_km=7500, interval_months=6 | ValidationError |

---

## AC ↔ 테스트 전체 매핑

| AC | 테스트 레이어 | 설명 |
|----|-------------|------|
| AC-V1 | unit | 차량 생성 유효성 |
| AC-V2 | unit | 주행거리 변경 → 재계산 |
| AC-V3 | unit | 월 평균 변경 → 재계산 |
| AC-V4 | e2e | 헤더 표시 |
| AC-M1 | unit | 항목 등록 유효성 |
| AC-M2 | unit | isChain 계산 스킵 |
| AC-M3 | unit | pkm/pmo XOR 검증 |
| AC-M4 | unit | 교환 기록 저장 + 재계산 트리거 |
| AC-M5 | unit | pkm 계산 정확성 |
| AC-M6 | unit | pmo 계산 정확성 |
| AC-M7 | unit + e2e | 일괄 교환 기록 |
| AC-M8 | unit | 상태 경계값 (89일/90일/179일/180일) |
| AC-M9 | unit | 초과 → urgent |
| AC-M10 | unit | 알림 정렬 |
| AC-M11 | e2e | 차량 전용 태그 표시 |
| AC-VZ1 | e2e | 탭 전환 |
| AC-VZ2 | e2e | 섹션 그룹화 |
| AC-VZ3~7 | e2e | 간트 차트 렌더링 |
| AC-VZ8~9 | e2e | 목록 테이블 |
| AC-VZ10~11 | e2e | 알림 카드 |
| AC-VZ12~13 | e2e | 사이드 패널 개폐 |
| AC-VZ14 | ui parity | 간트 화면 스냅샷 비교 |
| AC-VZ15 | e2e | 간트 초기 스크롤 TODAY 위치 (Playwright scrollLeft 검증) |
| AC-VZ16 | e2e | 모바일 카드 리스트 렌더링 (viewport 390×844) |
| AC-VZ17 | e2e | 바텀 시트 오픈·스와이프 닫기 (모바일 viewport) |
| AC-VZ18 | e2e | 태블릿+ 우측 패널 유지 (viewport 768×1024) |
| AC-VZ19 | e2e | 알림 카드 교환완료 버튼 → 다이얼로그 오픈 |
| AC-VZ20 | e2e | 패널 내 교환완료 기록 버튼 동작 |
| AC-M12 | e2e | 교환완료 다이얼로그 기본값 (오늘 날짜·현재 km) |
| AC-M13 | unit + e2e | 교환완료 저장 → MaintenanceRecord 생성 + 상태 재계산 |
| AC-M14 | e2e | 교환완료 후 알림 카드 즉시 갱신 (ok 전환 시 카드 제거) |

---

## 회귀 범위 (초안)

변경 발생 시 반드시 재검증해야 하는 영역:

1. **ScheduleCalculator** — 주기 계산 로직 변경 시 모든 unit 테스트
2. **상태 분류 경계값** — urgent/soon/ok 임계값 변경 시
3. **알림 집계 정렬** — AC-M10
4. **화면 parity** — UI 레이아웃 변경 시 AC-VZ14
