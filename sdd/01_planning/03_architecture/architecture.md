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
  - today: date                  // 실제 오늘 (new Date(), KST). D-day·상태·간트 TODAY 기준
  - reference_date: date         // current_km 측정일 (= 주행거리 기준일)
  - current_km: int              // reference_date 시점 주행거리
  - monthly_km: int              // annual_km/12 반올림 (≥1 보장)
  - last_km: int | null          // 교환 이력 없으면 null → 폴백
  - last_date: date | null       // 교환 이력 없으면 null → 폴백
  - interval_km: int | null      // pkm (XOR)
  - interval_months: int | null  // pmo (XOR)
  - is_chain: bool

outputs:
  - next_km: int | null
  - next_date: date | null
  - days_remaining: int | null            // next_date - today (음수 = 초과)
  - status: 'urgent'|'soon'|'ok'|'chain'|'unknown'
  - baseline: 'recorded' | 'estimated'     // 폴백(추정 기준점) 사용 여부
```

계산 규칙:
1. `is_chain=true` → 모든 output null, status='chain'
2. `monthly_km < 1` → 예정일 계산 불가. next_km/next_date/days_remaining=null, status='unknown'
3. **기준일 보정**: current_km는 reference_date 시점 값이므로 today 기준으로 환산한다.
   `current_km_today = current_km + (today - reference_date)/30 × monthly_km`
   (reference_date = today면 보정 0)
4. **이력 폴백**: last_km/last_date가 null이면 등록 시점을 가상 최초 교환점으로 간주, `baseline='estimated'`.
   - pkm: `last_km := current_km`, `last_date := reference_date`
   - pmo: `last_date := reference_date`, `last_km := current_km`
   - 이력 존재 시 `baseline='recorded'`
5. `interval_km`(pkm) 방식: `next_km = last_km + interval_km`
   → `next_date = today + (next_km - current_km_today) / monthly_km × 30`
6. `interval_months`(pmo) 방식: `next_date = last_date + interval_months`
   → `next_km = current_km_today + months_diff(today, next_date) × monthly_km`
7. `days_remaining = next_date - today`
8. 상태: `days_remaining < 90` → urgent(음수 초과 포함) / `< 180` → soon / else → ok

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
