# 테스트 전략

> 01_planning/10_test: 테스트 레이어 정의 및 AC 매핑.
> 테스트 도구: OD-1 확정 반영 — Jest(Nest.js) · Vitest(Next.js) · Playwright(E2E).

---

## 테스트 레이어

| 레이어 | 대상 | 도구 |
|--------|------|-----------|
| Unit | 도메인 로직 (ScheduleCalculator, 상태 분류) | Jest(api) / Vitest(web) |
| Integration | Repository 어댑터 + DB | Jest + Supertest |
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
| 이력 0건 폴백 (pkm) | last_km=null, last_date=null, cur=89660, ref=today, pkm=7500 | next_km=97160, baseline='estimated' |
| 이력 0건 폴백 (pmo) | last_km=null, last_date=null, ref=2026-06-15, pmo=6 | next_date=2026-12-15, baseline='estimated' |
| 기준일 보정 | cur=89660, ref=2026-05-15, today=2026-06-15, mon=750 | current_km_today≈90410 (약 30일 경과분 가산) |
| 누락 축 보간 (pkm record) | record_km=89485 only, ref·mon으로 date 보간 | record_date 채워짐, is_estimated_date=true |
| monthly_km 0 가드 | monthly_km=0 | status='unknown', next_date=null |

---

## AC ↔ 테스트 전체 매핑

| AC | 테스트 레이어 | 설명 |
|----|-------------|------|
| AC-V1 | unit | 차량 생성 유효성 (신규 필드 model_name·license_plate·manufacturer_code 포함) |
| AC-V2 | unit | 주행거리 변경 → 재계산 |
| AC-V3 | unit | 월 평균 변경 → 재계산 |
| AC-V4 | e2e | 헤더 표시 |
| AC-V5 | unit | 차량 1대 제한 (재등록 시 수정 화면 이동) |
| AC-V6 | e2e | 제원 선택 폼 코드 목록 표시 |
| AC-V7 | unit | 제원 조합별 프리셋 조회 (applicable_fuel_codes 기준 제외) |
| AC-V8 | e2e | 프리셋 항목 수락·수정·제외 동작 |
| AC-V9 | unit | annual_km → monthly_km 계산 정확성 |
| AC-V10 | e2e | 차량 미등록 시 빈 상태 화면 → SCR-03 이동 |
| AC-M1 | unit | 항목 등록 유효성 |
| AC-M2 | unit | isChain 계산 스킵 |
| AC-M3 | unit | pkm/pmo XOR 검증 |
| AC-M4 | unit | 교환 기록 저장 + 재계산 트리거 |
| AC-M5 | unit | pkm 계산 정확성 |
| AC-M6 | unit | pmo 계산 정확성 |
| ~~AC-M7~~ | — | **삭제됨 (#15, 2026-06-15)** |
| AC-M8 | unit | 상태 경계값 (89일/90일/179일/180일) |
| AC-M9 | unit | 초과 → urgent |
| AC-M10 | unit | 알림 정렬 |
| AC-M11 | e2e | 차량 전용 태그 표시 |
| AC-VZ1 | e2e | 카테고리 섹션 그룹화 (공통) |
| AC-VZ2 | unit | 연료·변속기 조합별 부품 필터 |
| AC-VZ3 | e2e | 모바일 티켓 카드 단일 뷰 (viewport 390×844) |
| AC-VZ4 | e2e | 티켓 카드 정보 항목 렌더링 |
| AC-VZ5 | e2e | 티켓 카드 테두리·텍스트 상태색 (배경 tint 미적용) |
| AC-VZ6 | e2e | chain 카드 날짜 행 미표시 |
| AC-VZ7 | e2e | 모바일 알림 카드 섹션 미노출 |
| AC-VZ8 | e2e | 태블릿+ 간트/목록 탭 전환 (viewport 768×1024) |
| AC-VZ9 | e2e | 알림 카드 집계·예정일 오름차순 정렬 |
| AC-VZ10 | e2e | 알림 없을 때 알림 영역 미노출 |
| AC-VZ11 | e2e | 간트 3년(36개월) 타임라인 렌더링 |
| AC-VZ12 | e2e | 간트 바 3종(완료/다음/미래) 렌더링 |
| AC-VZ13 | e2e | 간트 TODAY 수직선 표시 |
| AC-VZ14 | e2e + ui parity | 간트 초기 TODAY auto-scroll (scrollLeft 검증 + 스냅샷) |
| AC-VZ15 | e2e | chain 항목 "교체 불필요" 패턴 배너 |
| AC-VZ16 | e2e | 다음 교환 예정월 핀 레이블 |
| AC-VZ17 | e2e | 목록 테이블 6개 컬럼 |
| AC-VZ18 | e2e | 상태 색상 배지 |
| AC-VZ19 | e2e | 항목 탭→상세 패널 오픈·정보 항목 |
| AC-VZ20 | e2e | 모바일 바텀 시트 오픈·스와이프 닫기 (viewport 390×844) |
| AC-VZ21 | e2e | 태블릿+ 우측 사이드 패널 오픈·오버레이 닫기 (viewport 768×1024) |
| AC-VZ22 | e2e | 교환완료 입력 기본값(오늘·현재km)·저장 동작 |
| AC-VZ23 | e2e | 패널 닫기 (오버레이·✕·스와이프) |
| AC-M12 | e2e | 교환완료 다이얼로그 기본값 (오늘 날짜·현재 km) |
| AC-M13 | unit + e2e | 교환완료 저장 → MaintenanceRecord 생성 + 상태 재계산 |
| AC-M14 | e2e | 교환완료 후 알림 카드 즉시 갱신 (ok 전환 시 카드 제거) |
| AC-M15 | unit | 프리셋 조회 쿼리 정확성 (EV→engine_oil 제외, diesel→glow_plug 포함) |
| AC-M16 | unit | 프리셋 주기 수정 시 원본 프리셋 불변 (개인화 오버라이드) |

---

## 회귀 범위 (초안)

변경 발생 시 반드시 재검증해야 하는 영역:

1. **ScheduleCalculator** — 주기 계산 로직 변경 시 모든 unit 테스트
2. **상태 분류 경계값** — urgent/soon/ok 임계값 변경 시
3. **알림 집계 정렬** — AC-M10
4. **화면 parity** — UI 레이아웃 변경 시 AC-VZ14
