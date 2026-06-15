# carmaint — 프로젝트 현황 (Project Status)

> 마지막 업데이트: 2026-06-15  
> 현재 단계: **03_build Phase 0 완료 → Phase 1(DB 스키마) 착수 대기**

---

## 1. 단계별 진행 현황

| 단계 | 상태 | 비고 |
|------|------|------|
| 00_sources (원본 요구사항) | ✅ 완료 | 투싼 NX4 HEV 프로토타입 기반 분석 |
| 01_planning (명세 작성) | ✅ **완료** | 기능·화면·아키텍처·데이터·테스트 명세 |
| 02_plan (실행 계획) | ✅ **완료** | 기능별 구현 체크리스트 작성 완료 (2026-06-14) |
| 03_build (구현) | 🔨 **진행 중** | Phase 0 완료(골격 생성), Phase 1(DB) 착수 대기 |
| 04_verify (검증) | 🔲 미착수 | |

---

## 2. 확정된 핵심 결정 사항

### 2-1. 기술 스택 (전체 확정)

| 영역 | 결정 |
|------|------|
| 언어 | TypeScript (프론트·백 공통) |
| 프론트엔드 | **Next.js 14** (App Router) |
| 백엔드 | **Nest.js 10+** |
| ORM | **Prisma 5+** |
| DB | **SQLite** (DEV) / PostgreSQL 이식 가능 |
| UI 컴포넌트 | **shadcn/ui** + Tailwind CSS |
| 클라이언트 상태 | **Zustand** |
| 서버 상태 (API 캐싱) | **TanStack Query** |
| 폼 관리 | **React Hook Form** |
| 패키지 매니저 | **pnpm** (모노레포 workspace) |
| 테스트 | Jest (Nest.js) + Vitest (Next.js) + Playwright (E2E) |
| 배포 | Docker Compose (DEV) |

> 상세: [`sdd/01_planning/03_architecture/tech_stack.md`](01_planning/03_architecture/tech_stack.md)

### 2-2. 열린 결정 (OD) — 전체 확정

| OD | 결정 내용 |
|----|---------|
| OD-1 | 기술 스택: Next.js + Nest.js + Prisma + SQLite ✅ |
| OD-2 | 차량 1대 고정, 다중 차량 불가. 사용자·차량 1:1 ✅ |
| OD-3 | MVP 인증 없음 ✅ |
| OD-4 | SVG: `public/part-{category}-{slug}.svg` 정적 파일 ✅ |
| OD-5 | 프리셋: Prisma seed.ts에 전체 연료×변속기 조합 약 117개 포함(NX4 HEV 17개 포함) ✅ |

---

## 3. 01_planning 완료 문서 목록

| 문서 | 경로 | AC 수 | 상태 |
|------|------|-------|------|
| 기능 명세: 차량 | `01_planning/01_feature/vehicle_feature_spec.md` | 10 (V1~V10) | ✅ |
| 기능 명세: 정비 일정 | `01_planning/01_feature/maintenance_schedule_feature_spec.md` | 15 (M1~M16, M7 삭제) | ✅ |
| 기능 명세: 시각화 | `01_planning/01_feature/visualization_feature_spec.md` | 23 (VZ1~VZ23) | ✅ |
| 화면 명세 | `01_planning/02_screen/screen_spec.md` | — | ✅ |
| 아키텍처 | `01_planning/03_architecture/architecture.md` | — | ✅ |
| **기술 스택 결정** | `01_planning/03_architecture/tech_stack.md` | — | ✅ |
| 데이터 모델 | `01_planning/04_data/data_model.md` | — | ✅ |
| 테스트 전략 | `01_planning/10_test/test_strategy.md` | — | ✅ |
| **시드 데이터** | `99_toolchain/seed_data/code_and_presets.md` | — | ✅ |

**총 AC: 48개** (V10 + M15[M7 삭제] + VZ23)

---

## 4. 데이터 모델 요약

### 엔티티 목록 (9개)

| 엔티티 | 역할 |
|--------|------|
| `VehicleTypeCode` | 차종 코드 (경차·소형·SUV 등 10개) |
| `FuelTypeCode` | 연료 코드 (가솔린·디젤·LPG·HEV·PHEV·EV 6개) |
| `TransmissionTypeCode` | 변속기 코드 (AT·MT·DCT습식·DCT건식·CVT·e-motor 6개) |
| `ManufacturerCode` | 제조사 코드 (국산 6 + 기타) |
| `MaintenancePartMaster` | 부품 마스터 (25개 부품 정의, 점화코일·고무부싱 포함) |
| `MaintenanceIntervalPreset` | 제원 조합별 교환 주기 (약 117개 레코드) |
| `Vehicle` | 차량 (제원 코드 FK 포함, annual_km → monthly_km 파생) |
| `MaintenancePart` | 차량별 부품 인스턴스 (프리셋 복사 또는 수동) |
| `MaintenanceRecord` | 교환 이력 |

> 상세: [`sdd/01_planning/04_data/data_model.md`](01_planning/04_data/data_model.md)  
> 시드 데이터: [`sdd/99_toolchain/seed_data/code_and_presets.md`](99_toolchain/seed_data/code_and_presets.md)

---

## 5. 화면 구성 요약

### 반응형 분기: 640px

| 뷰포트 | 메인 뷰 | 상세 패널 | 알림 카드 |
|--------|--------|---------|---------|
| 모바일 (< 640px) | **티켓 카드 목록** (색상으로 긴급도 표현) | 바텀 시트 | ❌ 없음 |
| 태블릿+ (≥ 640px) | **간트 차트** / 목록 테이블 탭 | 우측 사이드 패널 | ✅ 있음 |

### 티켓 카드 상태 색상

> 표현 방식: 카드 테두리(stroke) + 부품명 텍스트 색 (배경 tint 미사용)

| 상태 | 색상 | 조건 |
|------|------|------|
| urgent 🔴 | rose | 90일 미만 또는 초과 |
| soon 🟡 | amber | 90~179일 |
| ok 🟢 | green | 180일 이상 |
| chain — | cyan | 교환 불필요 |
| unknown ⚪ | muted | 계산 불가 (monthly_km<1 등) |

### 주요 화면

| ID | 화면명 |
|----|--------|
| SCR-01 | 메인 대시보드 (반응형) |
| SCR-02 | 부품 상세 패널 + 교환완료 인라인 입력 |
| SCR-03 | 차량 등록·수정 (4단계: 기본→제원→주행→프리셋) |

> 헤더에서 **"최근 교환 요약" 배지 제거** (각 카드에서 확인 가능하므로)

> 상세: [`sdd/01_planning/02_screen/screen_spec.md`](01_planning/02_screen/screen_spec.md)

---

## 6. 핵심 비즈니스 로직

### 교환 주기 계산 (ScheduleCalculator)

```
pkm 방식:
  next_km   = last_record_km + interval_km
  next_date = today + (next_km - current_km) / monthly_km × 30일

pmo 방식:
  next_date = last_record_date + interval_months
  next_km   = current_km + months_diff(today, next_date) × monthly_km

monthly_km = annual_km / 12 (반올림)
```

### 상태 분류

```
days_remaining = next_date - today
is_chain=true  → status = 'chain'
days_remaining < 0 또는 < 90  → 'urgent'
days_remaining < 180           → 'soon'
else                           → 'ok'
```

### 프리셋 조회 쿼리

```sql
SELECT * FROM MaintenanceIntervalPreset
WHERE fuel_type_code = :vehicleFuel
  AND (transmission_code IS NULL OR transmission_code = :vehicleTrans)
```

---

## 7. Figma UI 플러그인 현황 (2026-06-15 추가)

`sdd/99_toolchain/figma_plugin/carmaint_screens.js` 로 화면 9개 자동 생성 완료.

| 완료 항목 | 내용 |
|-----------|------|
| SCR-01 모바일/태블릿+ | 티켓 카드 상태색 → 텍스트+테두리 포인트, 좌우 여백 16px |
| SCR-02 바텀 시트/사이드 패널 | 교환완료 인라인 입력 포함 |
| SCR-03 4단계 | Step1(기본정보) · Step2(제원선택) · Step3(주행정보) · Step4(프리셋확인) |
| SCR-01 빈 상태 | 차량 미등록 초기 화면 |
| 에러 핸들링 | try/catch + `figma.closePlugin` — 무한 로딩 버그 수정 |

---

## 8. 다음 세션에서 할 작업: Phase 1 — DB 스키마

Phase 0 골격 생성 완료. Phase 1에서 DB 스키마를 구현한다.

**다음 착수: Phase 1 — DB 스키마 & 시드 데이터**

```
주요 작업:
1. schema.prisma 에 9개 엔티티 모델 정의
2. seed.ts 작성 (코드 마스터 7종 + 프리셋 ~117개)
3. prisma migrate dev --name init 실행
4. Nest.js PrismaModule / PrismaService 구성
```

→ `sdd/02_plan/03_architecture/tech_stack_decision.md` Phase 1 체크리스트 참고  
→ `sdd/01_planning/04_data/data_model.md` 엔티티 명세 참고  
→ `sdd/99_toolchain/seed_data/code_and_presets.md` 시드 데이터 참고

---

## 8. 개발 참고사항

### Spring Boot ↔ Nest.js 대응

| Spring Boot | Nest.js |
|-------------|---------|
| `@SpringBootApplication` | `@Module()` |
| `@RestController` | `@Controller()` |
| `@Service` | `@Injectable()` |
| `@GetMapping` / `@PostMapping` | `@Get()` / `@Post()` |
| `@RequestBody` | `@Body()` |
| `@PathVariable` | `@Param()` |
| Bean Validation (`@Valid`) | class-validator + `ValidationPipe` |
| `application.yml` | `.env` + `ConfigModule` |

### 코드 주석 정책

사용자가 Spring Boot/WebSquare 배경에서 Next.js·Nest.js를 처음 학습하므로,
**처음 마주치는 패턴에는 Spring Boot 대응 개념을 한국어 주석으로 명시**한다.
반복되는 자명한 코드에는 주석 생략.

---

## 9. 프로토타입 참고

- 파일: `D:\prj\hybrid_schedule_v2.html`
- 차량: 투싼 NX4 하이브리드 (G1.6T, 21년식, 89,660km)
- 디자인 토큰 확정 (다크 테마, `--bg #0b0f19` 기준)
- 간트 차트 UI, 사이드 패널 구조, 부품 SVG 일러스트 참고용
