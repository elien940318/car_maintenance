# 기술 스택 결정 (OD-1 resolved)

> 결정일: 2026-06-14  
> 상태: **확정**

---

## 결정 요약

| 영역 | 선택 | 버전 기준 |
|------|------|----------|
| 언어 | TypeScript | 5.x |
| 프론트엔드 | **Next.js** (App Router) | 14+ |
| 백엔드 | **Nest.js** | 10+ |
| ORM | Prisma | 5+ |
| DB | SQLite (DEV) / PostgreSQL (운영 전환 가능) | — |
| API 통신 | REST (HTTP/JSON) | — |
| UI 컴포넌트 | **shadcn/ui** + Tailwind CSS | — |
| 간트 차트 | shadcn/ui + Tailwind CSS 직접 구현 | — |
| 클라이언트 상태 | **Zustand** | 4+ |
| 서버 상태 (API 캐싱) | **TanStack Query** (React Query) | 5+ |
| 폼 관리 | React Hook Form | 7+ |
| Nest.js 유효성 검사 | class-validator + class-transformer | — |
| 코드 품질 | ESLint + Prettier | — |
| 패키지 매니저 | pnpm (workspace 모노레포) | 8+ |
| 테스트 | Jest (Nest.js) + Vitest (Next.js) | — |
| 배포 | Docker Compose (DEV 단일 컨테이너 구성) | — |

---

## 선택 근거

### TypeScript 단일 언어

프론트엔드(Next.js)와 백엔드(Nest.js) 모두 TypeScript를 사용하여  
DTO·타입 정의를 공유하고 인지 부하를 줄인다.

### Next.js — App Router

- React 기반 SSR/SSG 프레임워크. DEV 환경에서 빠른 UI 프로토타이핑 가능.
- App Router(14+)는 서버 컴포넌트를 지원하여 데이터 패칭 로직을 컴포넌트에 내재화할 수 있다.
- WebSquare 대비: 선언적 컴포넌트 모델, 서버/클라이언트 렌더링 혼합 방식.

### Nest.js — Spring Boot 대응 비교

| Spring Boot | Nest.js | 역할 |
|-------------|---------|------|
| `@SpringBootApplication` | `@Module()` | 애플리케이션 최상위 모듈 |
| `@RestController` | `@Controller()` | HTTP 요청 핸들러 |
| `@Service` | `@Injectable()` | 비즈니스 로직 서비스 |
| `@Repository` | Prisma Service (DI 주입) | 데이터 접근 레이어 |
| `@GetMapping` / `@PostMapping` | `@Get()` / `@Post()` | HTTP 메서드 매핑 |
| `@RequestBody` | `@Body()` | 요청 본문 파라미터 |
| `@PathVariable` | `@Param()` | URL 경로 파라미터 |
| Bean Validation (`@Valid`) | class-validator + `@UsePipes` | DTO 유효성 검사 |
| `application.yml` | `.env` + ConfigModule | 환경 설정 |

### Prisma — ORM

- JPA/Hibernate 대비: 스키마 파일(`schema.prisma`)에서 엔티티를 정의하고  
  `prisma migrate` 로 마이그레이션을 자동 생성. 타입 안전한 쿼리 빌더 제공.
- SQLite로 시작해 PostgreSQL 전환 시 `provider`만 변경하면 된다.

### SQLite (DEV)

- 별도 DB 서버 없이 단일 파일로 동작. 로컬 개발 및 토이 프로젝트에 적합.
- 스키마 설계는 PostgreSQL 이식을 전제로 작성한다 (JSON 컬럼 미사용 등).

### shadcn/ui + Tailwind CSS

- shadcn/ui는 컴포넌트 라이브러리가 아니라 **소스 코드를 직접 프로젝트에 복사하는 방식**.
  (`npx shadcn@latest add button` → `components/ui/button.tsx`가 생성됨)
- WebSquare의 UI 위젯과 달리 컴포넌트를 직접 수정 가능. Radix UI 접근성 기반.
- 간트 차트는 별도 라이브러리 없이 Tailwind CSS의 `grid` / `flex` / 절대 위치로 직접 구현.
  → 학습 가치와 커스터마이징 자유도를 모두 확보.

### Zustand — 클라이언트 상태 관리

- 경량 전역 상태 관리. Redux 대비 보일러플레이트가 거의 없음.
- 주요 사용처: 현재 선택된 차량 ID, 간트 차트 뷰 상태(기준일·줌 레벨), 사이드 패널 열림 여부 등.

```ts
// Spring의 정적 싱글톤 유틸 클래스와 유사한 역할이지만 반응형(reactive)
const useVehicleStore = create<VehicleStore>((set) => ({
  currentKm: 0,
  setCurrentKm: (km) => set({ currentKm: km }),
}))
```

### TanStack Query — 서버 상태 관리

- Nest.js REST API 호출 결과를 **캐싱·자동 갱신·낙관적 업데이트** 처리.
- Spring의 `@Cacheable` / `@CacheEvict`와 유사한 개념을 클라이언트에서 구현.

```ts
// 데이터 조회: queryKey가 캐시 키 역할 (@Cacheable의 key와 동일 개념)
const { data } = useQuery({ queryKey: ['parts', vehicleId], queryFn: fetchParts })

// 정비 기록 저장 후 캐시 무효화 → 자동 재조회 (@CacheEvict 역할)
const mutation = useMutation({
  mutationFn: saveRecord,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parts', vehicleId] }),
})
```

- Zustand(UI 상태) + TanStack Query(서버 데이터)로 역할을 분리하여 관리.

### React Hook Form — 폼 관리

- 차량 등록·정비 기록 입력 폼에 사용. 비제어 컴포넌트 방식으로 리렌더링 최소화.
- shadcn/ui Form 컴포넌트와 기본 통합 지원.

---

## 프로젝트 디렉터리 구조 (예정)

```
carmaint/
├── apps/
│   ├── web/          # Next.js 14 (App Router)
│   │   ├── app/      # 페이지·레이아웃 (파일 기반 라우팅)
│   │   ├── components/
│   │   └── lib/      # API 클라이언트, 유틸
│   └── api/          # Nest.js
│       ├── src/
│       │   ├── vehicle/       # Vehicle 모듈
│       │   ├── maintenance/   # MaintenancePart 모듈
│       │   ├── schedule/      # ScheduleCalculator 도메인 서비스
│       │   └── prisma/        # PrismaService (DB 어댑터)
│       └── prisma/
│           └── schema.prisma  # 엔티티 정의
└── packages/
    └── types/         # 공유 DTO 타입 (선택, 모노레포 적용 시)
```

> 모노레포 도구: pnpm workspaces (또는 단순 멀티 디렉터리 구성으로 시작)

---

## 열린 결정 후속 처리

OD-1 결정으로 인해 다음 OD를 연쇄 결정한다:

| OD | 결정 | 근거 |
|----|------|------|
| OD-2 (멀티 차량) | **MVP: 단일 차량** | 학습 범위 최소화. Vehicle 엔티티는 다중 차량 대응 구조 유지 (id FK 설계). |
| OD-3 (인증) | **MVP: 인증 없음** | 토이 프로젝트 특성. 향후 NextAuth.js + JWT 추가 가능 구조로 설계. |
| OD-4 (SVG 관리) | **Next.js `public/` 정적 파일** | svg_key 필드로 참조. 파일명 규칙: `part-{category}-{slug}.svg` |
| OD-5 (부품 프리셋) | **Prisma seed 제공** | `prisma/seed.ts`에 투싼 NX4 HEV 17개 항목 시드 스크립트 포함. |
