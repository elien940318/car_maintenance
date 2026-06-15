# 03_build — 구현 현황 (current-state)

> 이 문서는 **런타임 조립 상태**를 기록한다. dated narrative는 남기지 않는다.

---

## Phase 0 — 프로젝트 골격

### 완료 항목

| 항목 | 경로 | 상태 |
|------|------|------|
| 모노레포 루트 | `pnpm-workspace.yaml`, `package.json` | ✅ |
| Next.js 14 (App Router) | `apps/web/` | ✅ 빌드 통과 |
| Nest.js 10 (strict TS) | `apps/api/` | ✅ 빌드 통과 |
| Prisma 7 초기화 (SQLite) | `apps/api/prisma/schema.prisma` | ✅ |
| pnpm workspace 의존성 | 루트 `node_modules/` | ✅ |

### 런타임 구성

| 항목 | 값 |
|------|----|
| Node.js | v24.16.0 (portable: `C:\Users\Metanet\tools\nodejs`) |
| pnpm | 11.7.0 (corepack via Node) |
| Next.js | 14.x |
| Nest.js | 10.x |
| Prisma | 7.x |
| DB | SQLite DEV (`apps/api/prisma/dev.db`, git 제외) |

### 파일 구조 (Phase 0 이후)

```text
carmaint/
├── apps/
│   ├── web/                  # Next.js 14 (App Router + Tailwind)
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── api/                  # Nest.js 10 (strict TS)
│       ├── src/
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   ├── app.service.ts
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma  # SQLite datasource (모델 미정의 — Phase 1에서 추가)
│       ├── prisma.config.ts   # Prisma 7 설정 (DATABASE_URL from .env)
│       ├── .env               # DATABASE_URL=file:./dev.db (git 제외)
│       └── package.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 다음 단계: Phase 1 — DB 스키마 구현

- `schema.prisma`에 9개 엔티티 정의
- `seed.ts` 작성 (코드 마스터 7종 + 프리셋 ~117개)
- `prisma migrate dev` 실행
- Nest.js PrismaModule, PrismaService 구성

상세 계획: `sdd/02_plan/03_architecture/tech_stack_decision.md`
