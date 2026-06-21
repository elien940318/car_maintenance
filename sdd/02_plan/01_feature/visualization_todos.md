# 시각화 — 실행 계획

> 참고: [sdd/01_planning/01_feature/visualization_feature_spec.md](../../01_planning/01_feature/visualization_feature_spec.md)  
> 참고: [sdd/01_planning/02_screen/screen_spec.md](../../01_planning/02_screen/screen_spec.md)  
> 상태: ✅ 완료 (Phase 3 구현 완료, 2026-06-21)  
> 마지막 업데이트: 2026-06-21

---

## 범위 (Scope)

| 컴포넌트 | 대상 뷰포트 | 주요 AC |
|---------|------------|--------|
| 모바일 긴급도 순 정렬 | 모바일 (< 640px) | VZ1 |
| 부품 필터링 (연료 미적용 제외) | 공통 | VZ2 |
| TicketCard | 모바일 (< 640px) | VZ3~VZ7 |
| AlertCard | 태블릿+ (≥ 640px) | VZ9, VZ10 |
| GanttChart | 태블릿+ (≥ 640px) | VZ11~VZ16 |
| ListTable | 태블릿+ (≥ 640px) | VZ17, VZ18 |
| PartDetailPanel (SidePanel + BottomSheet) | 공통 | VZ19~VZ23 |
| 교환완료 인라인 입력 영역 | 공통 (패널 내) | VZ22, M12 연동 |

---

## 전제 조건 (Assumptions)

- Phase 2 완료: `/vehicles/:vehicleId/parts` API가 `{ parts, alerts }` 형태로 계산값 포함 반환
- SVG 일러스트는 `public/part-{category}-{slug}.svg` 정적 파일 (OD-4 확정)
- 반응형 분기 기준: `640px` (Tailwind `sm:` breakpoint)
- GanttChart는 별도 라이브러리 없이 직접 구현 (SVG 또는 절대 위치 div 기반)
- 다크 테마 고정: 배경 `--bg #0b0f19` (프로토타입 기준)
- 간트 차트 TODAY auto-scroll: `scrollLeft` 계산 후 `scrollIntoView()` 또는 직접 설정

---

## 수락 기준 (AC 매핑)

| AC | 내용 요약 |
|----|---------|
| VZ1 | 모바일: 긴급도 순 단일 플랫 목록 (urgent→soon→ok→unknown→chain, 같은 상태 내 daysRemaining 오름차순) |
| VZ2 | 연료·변속기 조합에 미적용 부품 목록 제외 |
| VZ3 | 모바일: 티켓 카드 목록 단일 뷰 (간트·탭 없음) |
| VZ4 | 티켓 카드 정보: 부품명+태그+상태 / 주기→다음교환일·예상km / 최근교환 날짜·km |
| VZ5 | 상태별 카드 테두리(stroke) + 부품명 텍스트 색: urgent=rose / soon=amber / ok=green / chain=cyan (배경 tint 미사용) |
| VZ6 | chain 카드: "교체 불필요·모니터링" 텍스트, 날짜 행 생략 |
| VZ7 | 모바일 뷰에서 알림 카드 섹션 미표시 |
| VZ8 | 태블릿+: 간트 차트 / 목록 보기 탭 전환 |
| VZ9 | 태블릿+ 알림 카드: urgent+soon 집계, 예정일 오름차순 |
| VZ10 | 알림 없을 때 알림 영역 미표시 |
| VZ11 | 간트: 3년 타임라인 (월 단위) |
| VZ12 | 간트 바: 완료 바(낮은 불투명도) / 다음교환 바 / 미래 바(더 낮은 불투명도) |
| VZ13 | 간트 TODAY 수직선 |
| VZ14 | 간트 초기 렌더 시 TODAY가 가시 영역 좌측 1/4 위치로 auto-scroll (페이지 재방문 유지) |
| VZ15 | chain 항목: 교환 바 대신 "교체 불필요" 패턴 배너 |
| VZ16 | 다음 교환 예정월 핀 레이블 (바 위 표시) |
| VZ17 | 목록 뷰 컬럼: 항목명/주기/최근교환/다음교환예정일/예상km/상태 |
| VZ18 | 상태 색상 배지 |
| VZ19 | 항목 탭·클릭 시 상세 패널 오픈: 부품명·D-day·SVG·역할설명·통계·팁·교환완료 입력 |
| VZ20 | 모바일 (< 640px): 바텀 시트 (슬라이드업, max-h 75vh, 드래그 핸들, 스와이프 닫기) |
| VZ21 | 태블릿+ (≥ 640px): 우측 사이드 패널 (슬라이드인 0.28s cubic-bezier, blur 오버레이) |
| VZ22 | 교환완료 입력 영역 패널·시트 하단 고정: 날짜·km·메모·저장 버튼 |
| VZ23 | 패널 닫기: 오버레이 탭 / ✕ 버튼 / 핸들 스와이프 다운 |

---

## 실행 체크리스트

### Phase 3 — Next.js UI 컴포넌트

> 진행 상태 표기: `[ ]` 미착수 / `[→]` 진행 중 / `[x]` 완료

#### 공통 기반

- [x] **카테고리 색상 매핑** (`lib/codes.ts` — `CATEGORY_COLORS`)
  - engine+chain → "엔진·점화·구동계" / filter → "필터 & 공기" 등 8종 색상 정의
  - 태블릿+ 간트·목록 테이블에서 참조 (모바일 TicketCard는 카테고리 색 미사용)
- [ ] **부품 필터 유틸리티** (`lib/utils/part-filter.ts`)
  - `filterPartsByVehicle(parts, fuelCode)` → `applicable_fuel_codes`(master, 단일 진실원 #11)에 fuelCode 미포함 시 제외 (VZ2)
- [x] **상태 색상 토큰** (`lib/codes.ts` — `STATUS_COLORS`)
  - urgent: `#f87171` / soon: `#fbbf24` / ok: `#22c55e` / chain: `#38bdf8` / unknown: `#6b7a99`(muted, 계산 불가)

#### 모바일 — TicketCard

- [x] `components/dashboard/TicketCard.tsx`
  - 카드 테두리(stroke) 상태색 + 부품명 텍스트 상태색 (배경은 `--bg2` 통일, tint 미사용) (VZ5)
  - 1행 좌: 부품명 + 차량전용·CHAIN 태그 / 1행 우: D-day + 상태 아이콘·텍스트 (VZ4)
  - 2행 좌: 다음 교환 예정일 (큰 텍스트, `var(--text)`) (VZ4)
  - 2행 우하단: 교환 주기 (작은 muted 텍스트, 카테고리 색 미사용) (VZ4)
  - chain 카드: 날짜·주기 행 없음, "교체 불필요" 텍스트 (VZ6)
  - unknown 카드: "계산 불가" 텍스트 (muted)
  - 클릭 시 `onClick()` → panelStore → PartDetailPanel 오픈
- [x] `components/dashboard/TicketCardList.tsx`
  - 긴급도 순 단일 플랫 목록 (urgent→soon→ok→unknown→chain) (VZ1)
  - 같은 상태 내 daysRemaining 오름차순 정렬 (초과 일수 많은 순이 상단)
  - 카테고리 섹션 레이블 없음

#### 태블릿+ — AlertCard

- [x] `components/dashboard/AlertCards.tsx`
  - urgent·soon 항목 카드 (예정일 오름차순, AlertAggregator 결과 사용) (VZ9)
  - 부품명, 상태 배지(rose/amber), 남은 일수 또는 초과 일수 표시
  - urgent+soon 0개 시 섹션 미표시 (VZ10)
  - 클릭 시 panelStore → PartDetailPanel 오픈 (VZ7: 모바일에서는 이 컴포넌트 미렌더링)

#### 태블릿+ — GanttChart

- [x] `components/dashboard/GanttChart.tsx`
  - SVG 기반 42개월 타임라인 (today 기준 약 -6개월 ~ +36개월) (VZ11)
  - 각 정비 항목별 행 렌더링
    - 완료 바: last_record.date ~ today (낮은 opacity) (VZ12)
    - 다음 교환 바: today ~ next_date (VZ12)
    - 미래 바: next_date ~ next_next_date (더 낮은 opacity) (VZ12)
  - TODAY 수직선 (VZ13)
  - 초기 렌더 시 `useEffect`에서 `scrollLeft` 자동 설정 → TODAY가 좌측 1/4 위치 (VZ14)
  - chain 항목: 사선 stripe 패턴 배너 (VZ15)
  - 다음 교환 예정월 핀 레이블 (VZ16)
  - 카테고리 섹션 레이블(점선 구분선) 포함

#### 태블릿+ — ListTable

- [x] `components/dashboard/PartTable.tsx`
  - 컬럼: 항목명 / 주기 / 최근 교환 / 다음 교환 예정일 / 예상 km / 상태 (VZ17)
  - 상태 색상 배지 (VZ18)
  - 행 클릭 시 panelStore → PartDetailPanel 오픈

#### 메인 페이지 반응형 분기

- [x] `components/dashboard/Dashboard.tsx` + `app/page.tsx` — 메인 대시보드 (SCR-01)
  - `< 640px`: TicketCardList 단일 뷰, AlertCards·탭·GanttChart 미렌더링 (VZ3, VZ7)
  - `≥ 640px`: AlertCards 섹션 (조건부) + 간트/테이블 탭 전환 (VZ8, VZ9, VZ10)
  - 탭 상태: `useState('gantt'|'table')` (Dashboard 로컬 상태)
  - TanStack Query로 `/vehicles/:id/parts` 패칭 → parts + vehicle 주입

#### PartDetailPanel (공통)

> 실제 구현은 Dashboard.tsx에서 640px 분기 후 각각 렌더링. 공통 wrapper 파일 없음.

- [x] `components/panel/PartDetailSheet.tsx` — 모바일 바텀 시트 (VZ20)
  - 하단 슬라이드업 (max-height: 75vh, 내부 스크롤)
  - 상단 드래그 핸들 + 터치 스와이프 닫기
  - 오버레이 탭 닫기 (VZ23)
- [x] `components/panel/PartDetailPanel.tsx` — 태블릿+ 우측 사이드 패널 (VZ21)
  - 우측 슬라이드-인: `translateX(100%)` → `translateX(0)`, 0.28s `cubic-bezier(0.4,0,0.2,1)`
  - backdrop-blur 오버레이
  - ✕ 버튼 + 오버레이 클릭 닫기 (VZ23)
- [x] `components/panel/PartDetailContent.tsx` — 공통 콘텐츠 (VZ19)
  - 부품명 · 서브태그 · D-day (초과 일수 포함)
  - 부품 구조 SVG 일러스트 (`public/part-{category}-{slug}.svg`)
  - 부품 역할 설명
  - 교환 통계 2×2 그리드 (주기 / 다음 교환일 / 예상 km / 남은 날짜)
  - 정비 팁
- [x] `components/panel/RecordCompletionForm.tsx` — 하단 고정 교환완료 입력 (VZ22, AC-M12)
  - 교환 날짜 DatePicker (기본=오늘)
  - 교환 km NumberInput (기본=차량 current_km)
  - 메모 TextInput (선택)
  - 저장 버튼 → `POST /records` → TanStack Query invalidate → 상태 즉시 갱신

---

## 현재 작업 메모 (Current Notes)

**Phase 3 완료 (2026-06-21)** — 전체 VZ AC 구현 완료.

- **실제 파일 경로**: 계획 시 예상한 `components/PartDetailPanel/` 구조 대신 `components/panel/` 하위에 별도 파일로 분리 구현.
  - `PartDetailSheet.tsx` (모바일) + `PartDetailPanel.tsx` (태블릿+) + `PartDetailContent.tsx` (공통 콘텐츠) + `RecordCompletionForm.tsx`
- **GanttChart**: 42개월 SVG 구현. `scrollLeft` auto-scroll은 `useEffect` + `containerRef`로 처리.
- **바텀 시트**: 터치 스와이프 닫기 구현 완료.
- **TicketCardList**: 카테고리 그룹화 → 긴급도 순 정렬로 변경 (2026-06-21 UI 개선).
- **TicketCard**: 카드 레이아웃 재설계 — 교환 예정일 크게 + 주기 작게(우하단) + 기준일 행 삭제 (2026-06-21 UI 개선).
- **Zustand panelStore**: `selectedPart`(PartWithSchedule) + `selectedVehicle` + `isOpen` 전역 상태로 패널 제어.
- **잔여 미구현 (VZ2)**: `filterPartsByVehicle()` 유틸 — 연료 미적용 부품 프론트엔드 필터링. 현재 API 응답이 이미 해당 차량 연료 기준으로 프리셋 적용된 parts만 반환하므로 실질적 영향 낮음.

---

## 검증 (Validation)

| AC | 레이어 | 검증 방법 |
|----|--------|---------|
| VZ1 | e2e | Playwright(mobile 390×844): 첫 카드가 urgent, 두 번째 urgent가 daysRemaining 오름차순, 카테고리 섹션 헤더 DOM 없음 확인 |
| VZ2 | unit | filterPartsByVehicle(parts, 'ev') → engine_oil 미포함 |
| VZ3 | e2e | Playwright: viewport 390×844 → GanttChart DOM 없음 확인 |
| VZ4 | e2e | Playwright: TicketCard 1행(부품명·D-day), 2행(큰 날짜·작은 주기) 렌더링 확인. 기준일 행 DOM 없음 확인 |
| VZ5 | e2e | Playwright: urgent 카드 `border-color: #f87171` + 부품명 `color: #f87171` 확인, 배경 tint 미적용 확인 |
| VZ6 | e2e | Playwright: chain 카드 날짜 행 DOM 미존재 확인 |
| VZ7 | e2e | Playwright: viewport 390×844 → AlertCard 섹션 DOM 없음 확인 |
| VZ8 | e2e | Playwright: viewport 768×1024 → 탭 전환 클릭 후 뷰 교체 확인 |
| VZ9 | e2e | Playwright: AlertCard 항목 예정일 오름차순 정렬 확인 |
| VZ10 | e2e | Playwright: urgent+soon 항목 0개 시 알림 섹션 DOM 없음 |
| VZ11 | e2e | Playwright: GanttChart 컨테이너 내 36개(3년×12개월) 컬럼 헤더 확인 |
| VZ12 | e2e | Playwright: 정비 항목 행에 3종 바(완료/다음/미래) 클래스 확인 |
| VZ13 | e2e | Playwright: TODAY 수직선 요소 존재 확인 |
| VZ14 | e2e | Playwright: GanttChart 마운트 후 `scrollLeft > 0` 확인 (auto-scroll) |
| VZ14 | ui-parity | Playwright 스냅샷: GanttChart 초기 렌더 스크린샷 비교 |
| VZ15 | e2e | Playwright: chain 항목 행에 패턴 배너 클래스 존재, 교환 바 미존재 |
| VZ16 | e2e | Playwright: 다음 교환 바 위 핀 레이블 텍스트 존재 확인 |
| VZ17 | e2e | Playwright: ListTable 6개 컬럼 헤더 렌더링 확인 |
| VZ18 | e2e | Playwright: 상태 배지 색상 클래스 확인 |
| VZ19 | e2e | Playwright: 항목 클릭 → 패널 오픈 → 부품명·SVG·통계 렌더링 확인 |
| VZ20 | e2e | Playwright: viewport 390×844 → 항목 클릭 → BottomSheet 오픈 확인 |
| VZ21 | e2e | Playwright: viewport 768×1024 → 항목 클릭 → SidePanel 오픈 확인 |
| VZ22 | e2e | Playwright: 패널 내 날짜 기본값=오늘, km 기본값=vehicle.current_km 확인 |
| VZ23 | e2e | Playwright: 오버레이 클릭 / ✕ 버튼 / 스와이프 시뮬레이션 → 패널 닫힘 확인 |
