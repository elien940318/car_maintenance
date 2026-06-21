# 04_verify — Phase 4 E2E 검증 현황

> 검증 단계: Phase 4 Playwright E2E  
> 마지막 업데이트: 2026-06-21

---

## 환경

| 항목 | 값 |
|------|----|
| Playwright | ^1.61.0 |
| 브라우저 | Chromium (Headless) |
| 프로젝트 | desktop (1280×800) / mobile (390×844) / tablet (810×1080) |
| 실행 명령 | `pnpm exec playwright test` |
| 서버 전제 | `pnpm dev` — API(3001) + Web(3000) 모두 기동 상태 |

---

## 실행 결과 요약 (2026-06-21)

| 항목 | 결과 |
|------|------|
| 총 테스트 수 | 75 (25 specs × 3 projects) |
| 통과 | **72** |
| 스킵 | **3** (VZ23 닫기 버튼 — 3개 프로젝트 공통) |
| 실패 | **0** |

---

## 스펙 파일별 결과

| 파일 | 대상 AC | 통과 | 스킵 |
|------|--------|------|------|
| `vehicle.spec.ts` | V4, V5, V6, V10 | 12 | 0 |
| `mobile-dashboard.spec.ts` | VZ1, VZ3, VZ4, VZ5, VZ6, VZ7 | 18 | 0 |
| `tablet-dashboard.spec.ts` | VZ8, VZ9, VZ10, VZ11~VZ14, VZ17, VZ18 | 18 | 0 |
| `part-detail.spec.ts` | M11, VZ19, VZ20, VZ21, VZ23 | 9 | 3 |
| `record-completion.spec.ts` | M12, M13, M14, VZ22 | 15 | 0 |

---

## AC별 검증 결과

### 차량 (Vehicle)

| AC | 테스트 결과 | 메모 |
|----|-----------|------|
| V4 | ✅ PASS | 헤더 차량명·current_km 렌더링 확인 |
| V5 | ✅ PASS | `/vehicle/new` → `/vehicle/edit` 리다이렉트 확인 |
| V6 | ✅ PASS | `/vehicle/edit` Step1 폼 렌더링 확인 |
| V10 | ✅ PASS | 차량 있을 때 헤더 렌더링 확인 |

### 정비 일정 (Maintenance)

| AC | 테스트 결과 | 메모 |
|----|-----------|------|
| M11 | ✅ PASS | `차량 전용` 태그 렌더링 확인 |
| M12 | ✅ PASS | 교환완료 폼 기본값(날짜=오늘, km=현재km) 확인 |
| M13 | ✅ PASS | 교환완료 저장 후 오류 없음 확인 |
| M14 | ✅ PASS | API parts 응답 schedule.status 구조 확인 (smoke) |

### 시각화 (Visualization)

| AC | 테스트 결과 | 메모 |
|----|-----------|------|
| VZ1 | ✅ PASS | urgent 카드 > ok 카드 순서 검증 |
| VZ3 | ✅ PASS | 모바일 390×844 티켓 카드 렌더링, 간트 비표시 |
| VZ4 | ✅ PASS | 교환 예정일 표시, 주기 텍스트 표시 |
| VZ5 | ✅ PASS | urgent 카드 `#f87171` 테두리 확인 |
| VZ6 | ✅ PASS | D-/D+ 텍스트 확인 |
| VZ7 | ✅ PASS (VZ3과 동일 스펙 포함) | 모바일 티켓 카드 목록 확인 |
| VZ8 | ✅ PASS | 태블릿 간트/목록 탭 확인 |
| VZ9 | ✅ PASS | 알림 카드 영역 존재 확인 |
| VZ10 | ✅ PASS | (VZ9와 동일 범위) |
| VZ11 | ✅ PASS | 간트 SVG 렌더링 확인 |
| VZ13 | ✅ PASS | TODAY 라인 SVG 요소 확인 |
| VZ14 | ✅ PASS | SVG 요소 포함 확인 (scrollLeft 정밀 검증은 residual) |
| VZ17 | ✅ PASS | 목록 테이블 렌더링 확인 |
| VZ18 | ✅ PASS | 상태 배지 표시 확인 |
| VZ19 | ✅ PASS | 사이드 패널 오픈 확인 |
| VZ20 | ✅ PASS | 모바일 바텀 시트 오픈 확인 |
| VZ21 | ✅ PASS (VZ19와 동일) | 태블릿 사이드 패널 |
| VZ22 | ✅ PASS | 교환완료 저장 후 갱신 확인 |
| VZ23 | ⚠️ SKIP | 닫기 버튼 텍스트 선택자 미매칭 — 패널 닫기 기능은 수동 검증 필요 |

---

## 단위 테스트 결과 (Phase 2 기존)

| 스펙 | 결과 |
|------|------|
| `schedule-calculator.spec.ts` | ✅ 22개 PASS |

---

## 잔여 위험 (Residual Risk)

| 항목 | 설명 | 해소 방법 |
|------|------|---------|
| VZ23 닫기 버튼 | 패널·시트 닫기 버튼 선택자가 텍스트 불일치로 스킵 | 버튼에 `data-testid="close-panel"` 추가 후 재검증 |
| VZ2 front-end 필터 | `filterPartsByVehicle()` 미구현 — API 단에서 필터링 | 저우선순위 (API 이미 연료코드 기준 필터) |
| VZ14 scrollLeft | 간트 초기 스크롤 위치 픽셀 검증 미실시 | 스냅샷 기준이미지 생성 후 `--update-snapshots`로 등록 |
| 실기기 모바일 | Chromium viewport 시뮬레이션 (WebKit 미설치) | 실기기 또는 `playwright install webkit` 후 재검증 |
| V1~V3, V7~V9 | 단위 테스트 미작성 (API 서비스 레이어) | Phase 4 후속 — 🔴 우선순위 |
| M1~M10, M15~M16 | 단위 테스트 미작성 (도메인 로직) | Phase 4 후속 — 🔴 우선순위 |

---

## 회귀 범위

회귀 선택 기준은 `sdd/02_plan/10_test/regression_verification.md`를 따른다.  
본 검증 대상: Phase 3 UI 변경 (긴급도 정렬, 카드 레이아웃, 색상) + 전체 E2E 경로.
