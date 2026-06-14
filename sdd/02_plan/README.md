# 02_plan

> 실행 계획 파일 디렉터리. 기능별 구현 계획 및 체크리스트.  
> 마지막 업데이트: 2026-06-14

## 현재 상태

| 파일 | 대상 AC | 상태 |
|------|--------|------|
| `03_architecture/tech_stack_decision.md` | Phase 0~4 골격 | ✅ 완료 |
| `01_feature/vehicle_todos.md` | V1~V10 | ✅ 완료 |
| `01_feature/maintenance_todos.md` | M1~M16 | ✅ 완료 |
| `01_feature/visualization_todos.md` | VZ1~VZ23 | ✅ 완료 |
| `10_test/regression_verification.md` | 회귀 범위 정의 | ✅ 완료 |

## 다음 단계

**Phase 0 착수** → `03_architecture/tech_stack_decision.md` 체크리스트 순서대로 진행

## 디렉터리 구조

```
02_plan/
├── 01_feature/
│   ├── vehicle_todos.md            ← 차량 등록·관리 (AC-V1~V10)
│   ├── maintenance_todos.md        ← 정비 일정 관리 (AC-M1~M16)
│   └── visualization_todos.md      ← 시각화 컴포넌트 (AC-VZ1~VZ23)
├── 03_architecture/
│   └── tech_stack_decision.md      ← 기술 스택 셋업 (Phase 0~4)
└── 10_test/
    └── regression_verification.md  ← 회귀 검증 범위 및 AC 매핑
```
