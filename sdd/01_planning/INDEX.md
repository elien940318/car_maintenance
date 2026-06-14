# 01_planning INDEX

> carmaint SDD 계획 문서 목록.

## Feature 명세 (01_feature)

| 문서 | 도메인 | 상태 |
|------|--------|------|
| [vehicle_feature_spec.md](01_feature/vehicle_feature_spec.md) | 차량 등록·관리 | 초안 |
| [maintenance_schedule_feature_spec.md](01_feature/maintenance_schedule_feature_spec.md) | 정비 일정 관리 | 초안 |
| [visualization_feature_spec.md](01_feature/visualization_feature_spec.md) | 간트·목록 시각화 | 초안 |

## 화면 명세 (02_screen)

| 문서 | 화면 | 상태 |
|------|------|------|
| [screen_spec.md](02_screen/screen_spec.md) | 전체 화면 구성 | 초안 |

## 아키텍처 (03_architecture)

| 문서 | 내용 | 상태 |
|------|------|------|
| [architecture.md](03_architecture/architecture.md) | 도메인 모델·레이어 구조 | 초안 |

## 데이터 모델 (04_data)

| 문서 | 내용 | 상태 |
|------|------|------|
| [data_model.md](04_data/data_model.md) | 엔티티·관계·주요 필드 | 초안 |

## 테스트 전략 (10_test)

| 문서 | 내용 | 상태 |
|------|------|------|
| [test_strategy.md](10_test/test_strategy.md) | 테스트 레이어·AC 매핑 | 초안 |

---

## 열린 결정 사항 (Open Decisions)

| # | 주제 | 결정 필요 시점 |
|---|------|--------------|
| OD-1 | 기술 스택 (언어/프레임워크/DB) | 01_planning 검토 후 |
| OD-2 | 멀티 차량 지원 여부 (MVP 포함 or Phase 2) | 기능 명세 확정 시 |
| OD-3 | 인증·사용자 계정 필요 여부 | OD-1 결정 후 |
| OD-4 | 부품별 SVG 일러스트 소스 관리 방식 | 화면 명세 확정 시 |
| OD-5 | 차량 모델별 부품 프리셋 제공 여부 | OD-2 결정 후 |
