# CLAUDE.md

## What This Is

자동차 부품별 정비 일정관리 서비스 `carmaint`의 Claude 실행 규칙과 하네스 위치를 설명하는 문서다.

---

## Environment Naming Policy

- 문서/대화/로그에서 실행 환경은 항상 `DEV(개발계)`로 표기한다.
- `local`, `localhost 환경` 같은 표현은 운영 용어로 사용하지 않는다.

---

## Harness Layout

```text
carmaint/
├── .claude/              # Claude 설정
│   ├── CLAUDE.md         # 이 파일
│   ├── agents/           # Claude role agents
│   └── skills/           # Claude Code repo-local skills
├── apps/                 # 애플리케이션 소스 (Phase 0 이후 생성)
│   ├── web/              # Next.js 14 (App Router)
│   └── api/              # Nest.js + Prisma
│       └── prisma/
│           ├── schema.prisma
│           └── seed.ts
├── sdd/                  # Software Delivery Documentation
│   ├── PROJECT_STATUS.md # 전체 현황 요약 (세션 시작 시 먼저 읽을 것)
│   ├── 00_sources/       # 원본 요구사항
│   ├── 01_planning/      # 기능/화면/아키텍처/데이터/테스트 명세 ✅ 완료
│   ├── 02_plan/          # 실행 계획 파일
│   ├── 03_build/         # 구현 현황 요약 (current-state)
│   ├── 04_verify/        # 검증 현황 요약
│   ├── 05_operate/       # 운영 기록
│   └── 99_toolchain/     # 자동화 스크립트, 시드 데이터
│       └── seed_data/    # 코드 마스터 + 정비 주기 프리셋
└── packages/             # 공유 타입 패키지 (미사용 — #14, web·api 각자 타입 정의)
```

---

## Project Status

- **현재 단계**: 02_plan 완료 → **03_build(Phase 0) 착수 대기**
- **기술 스택**: 확정 (Next.js + Nest.js + Prisma + SQLite + shadcn/ui + Zustand + TanStack Query)
- **AC 총계**: 48개 (V10 + M15[M7 삭제] + VZ23)
- **전체 현황**: `sdd/PROJECT_STATUS.md`
- **참고 프로토타입**: `D:\prj\hybrid_schedule_v2.html` (투싼 NX4 HEV)

---

## Working Rules

### 문서 규칙
- 컨벤션과 실행 규칙의 정본은 `sdd/99_toolchain/02_policies`에 둔다.
- `sdd/03_build`는 runtime assembly를 설명하는 current-state 문서이며 dated execution narrative를 남기지 않는다.
- 새 세션 시작 시 `sdd/PROJECT_STATUS.md`를 먼저 읽어 컨텍스트를 복원한다.

### 배포 규칙
- DEV 반영이 필요한 작업은 항상 `main push → DEV 배포 → DEV 검증` 순서를 따른다.

### 코드 주석 정책
- 사용자는 Spring Boot/WebSquare 경험자로 Next.js·Nest.js를 처음 학습 중이다.
- **처음 마주치는 패턴**에는 Spring Boot 대응 개념을 한국어 주석으로 명시한다.
  - 예: `// @Module() = Spring의 @SpringBootApplication 역할`
  - 예: `// @Injectable() = Spring의 @Service와 동일한 DI 등록`
- 반복되는 자명한 코드에는 주석 생략.

### Spring Boot ↔ Nest.js 대응 (주석 작성 참고)

| Spring Boot | Nest.js | 역할 |
|-------------|---------|------|
| `@SpringBootApplication` | `@Module()` | 최상위 모듈 |
| `@RestController` | `@Controller()` | HTTP 핸들러 |
| `@Service` | `@Injectable()` | 비즈니스 로직 |
| `@GetMapping` / `@PostMapping` | `@Get()` / `@Post()` | 라우팅 |
| `@RequestBody` | `@Body()` | 요청 본문 |
| `@PathVariable` | `@Param()` | URL 파라미터 |
| Bean Validation (`@Valid`) | class-validator + `ValidationPipe` | 유효성 검사 |
| `application.yml` | `.env` + `ConfigModule` | 환경 설정 |

---

## Key Architecture Decisions

### 반응형 분기 (640px)

| 뷰포트 | 메인 뷰 | 상세 패널 |
|--------|--------|---------|
| 모바일 (< 640px) | 티켓 카드 목록 (알림 카드·탭·간트 없음) | 바텀 시트 |
| 태블릿+ (≥ 640px) | 간트 차트 / 목록 테이블 탭 | 우측 사이드 패널 |

### 티켓 카드 상태 색상

| 상태 | 색상 | 조건 |
|------|------|------|
| urgent | rose `#f87171` | 90일 미만 또는 초과 |
| soon | amber `#fbbf24` | 90~179일 |
| ok | green `#22c55e` | 180일 이상 |
| chain | cyan `#38bdf8` | 교환 불필요 |
| unknown | muted `#6b7a99` | 계산 불가 (monthly_km<1 등) |

> 상태색은 배경 tint가 아니라 카드 테두리(stroke) + 부품명 텍스트 색으로 표현한다.

### 교환 주기 계산

```
pkm: next_km = lkm + pkm  /  next_date = today + (next_km - cur_km) / monthly_km × 30
pmo: next_date = ldt + pmo개월  /  next_km = cur_km + months_diff × monthly_km
monthly_km = annual_km / 12
```
