# 01_planning INDEX

> carmaint SDD 계획 문서 목록.  
> **상태: 전체 완료** (2026-06-14) — 총 AC 48개 확정

---

## Feature 명세 (01_feature)

| 문서 | 도메인 | AC | 상태 |
|------|--------|-----|------|
| [vehicle_feature_spec.md](01_feature/vehicle_feature_spec.md) | 차량 등록·관리·제원 입력·프리셋 연동 | V1~V9 (9개) | ✅ 완료 |
| [maintenance_schedule_feature_spec.md](01_feature/maintenance_schedule_feature_spec.md) | 정비 일정 계산·상태 분류·프리셋·교환완료 | M1~M16 (16개) | ✅ 완료 |
| [visualization_feature_spec.md](01_feature/visualization_feature_spec.md) | 티켓 카드·간트·테이블·패널·색상 규칙 | VZ1~VZ23 (23개) | ✅ 완료 |

**총 AC: 48개**

---

## 화면 명세 (02_screen)

| 문서 | 화면 | 상태 |
|------|------|------|
| [screen_spec.md](02_screen/screen_spec.md) | SCR-01~03 (반응형 분기, 티켓 카드, 인라인 교환완료) | ✅ 완료 |

---

## 아키텍처 (03_architecture)

| 문서 | 내용 | 상태 |
|------|------|------|
| [architecture.md](03_architecture/architecture.md) | 도메인 모델·헥사고날 레이어 구조 | ✅ 완료 |
| [tech_stack.md](03_architecture/tech_stack.md) | 기술 스택 전체 확정 (OD-1 resolved) | ✅ **확정** |

---

## 데이터 모델 (04_data)

| 문서 | 내용 | 상태 |
|------|------|------|
| [data_model.md](04_data/data_model.md) | 엔티티 8개·코드 테이블·프리셋·계산 뷰 | ✅ 완료 |

---

## 테스트 전략 (10_test)

| 문서 | 내용 | 상태 |
|------|------|------|
| [test_strategy.md](10_test/test_strategy.md) | Unit·E2E·UI Parity / AC 전체 매핑 | ✅ 완료 |

---

## 열린 결정 사항 (Open Decisions) — 전체 확정

| OD | 주제 | 결정 |
|----|------|------|
| OD-1 | ~~기술 스택~~ | ✅ Next.js + Nest.js + Prisma + SQLite ([tech_stack.md](03_architecture/tech_stack.md)) |
| OD-2 | ~~멀티 차량 지원~~ | ✅ MVP: 단일 차량. DB는 다중 차량 구조 유지 |
| OD-3 | ~~인증·사용자 계정~~ | ✅ MVP: 인증 없음 |
| OD-4 | ~~SVG 관리 방식~~ | ✅ `public/part-{category}-{slug}.svg` 정적 파일 |
| OD-5 | ~~차량 모델별 프리셋~~ | ✅ `prisma/seed.ts` + `99_toolchain/seed_data/code_and_presets.md` |

---

## 다음 단계

→ `sdd/02_plan/` 기능별 실행 계획 작성  
→ Phase 0: 프로젝트 골격 생성 (`apps/web` + `apps/api` + Prisma 초기화)

전체 현황: [`sdd/PROJECT_STATUS.md`](../PROJECT_STATUS.md)
