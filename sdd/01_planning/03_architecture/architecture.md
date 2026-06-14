# 아키텍처 계획

> 01_planning/03_architecture: 도메인 모델 및 레이어 구조 설계.
> 기술 스택은 미결정 (OD-1). 이 문서는 스택 독립적 도메인 설계를 다룬다.

---

## 도메인 모델

### 핵심 도메인 개념

```
Vehicle (차량)
  └── MaintenancePart[] (정비 부품 목록)
        └── MaintenanceRecord[] (교환 이력)
```

### 엔티티 관계

```
Vehicle 1 ──< MaintenancePart N
MaintenancePart 1 ──< MaintenanceRecord N
```

---

## 레이어 구조 (헥사고날 아키텍처 기반)

```
┌─────────────────────────────────────────┐
│            Presentation Layer            │
│   (Web UI / API Controller / TUI)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Application Layer              │
│  VehicleService / ScheduleService /      │
│  MaintenanceRecordService                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│             Domain Layer                 │
│  Vehicle / MaintenancePart /             │
│  MaintenanceRecord / ScheduleCalculator  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Infrastructure Layer            │
│  Repository (DB Adapter) /               │
│  NotificationAdapter (future)            │
└─────────────────────────────────────────┘
```

---

## 도메인 서비스

### ScheduleCalculator (핵심 도메인 로직)

정비 일정 계산 알고리즘. 스택 독립적 순수 함수.

```
inputs:
  - current_km: int
  - monthly_km: int
  - today: date
  - last_km: int | null
  - last_date: date | null
  - interval_km: int | null   (pkm)
  - interval_months: int | null (pmo)
  - is_chain: bool

outputs:
  - next_km: int | null
  - next_date: date | null
  - status: 'urgent' | 'soon' | 'ok' | 'chain'
  - days_remaining: int | null   (음수 = 초과)
```

계산 규칙:
1. `is_chain=true` → 모든 output null, status='chain'
2. `interval_km` 방식: `next_km = last_km + interval_km`
   → `next_date = today + (next_km - current_km) / monthly_km * 30`
3. `interval_months` 방식: `next_date = last_date + interval_months`
   → `next_km = current_km + months_diff(today, next_date) * monthly_km`
4. 상태: `days_remaining < 0` → urgent / `< 90` → urgent / `< 180` → soon / else → ok

### AlertAggregator

urgent + soon 항목을 수집하여 예정일 오름차순으로 정렬하는 서비스.

---

## 바운디드 컨텍스트

| 컨텍스트 | 책임 |
|---------|------|
| Vehicle | 차량 정보 등록·수정 |
| Maintenance | 부품·교환 주기·교환 이력 관리 |
| Schedule | 다음 교환 예정일 계산 및 상태 분류 |
| Notification | 알림 집계 및 전달 (Phase 2) |

---

## 열린 결정 (OD-1)

기술 스택이 결정되면 아래를 보완한다:

| 항목 | 후보 |
|------|------|
| 언어 | Python / TypeScript / Go |
| 프레임워크 | FastAPI / Express / Fiber |
| DB | SQLite / PostgreSQL / 로컬 JSON |
| 프론트엔드 | React / Vue / HTMX / 순수 HTML+JS |
| 테스트 | pytest / jest / vitest |
| 배포 | 로컬 / Docker / Vercel |

스택 결정 후 이 문서에 `03_architecture/tech_stack.md`를 추가한다.
