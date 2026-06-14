# carmaint

자동차 부품별 정비 일정관리 서비스 (토이 프로젝트).

차량 제원(연료·변속기·차종)과 연간 주행거리를 입력하면 부품별 교환 주기 프리셋을 제안하고,
다음 교환 예정일을 자동 계산해 **티켓 카드(모바일) / 간트 차트(태블릿+)** 로 시각화한다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14 (App Router) + shadcn/ui + Tailwind CSS |
| 상태 관리 | Zustand (클라이언트) + TanStack Query (서버) |
| 백엔드 | Nest.js |
| ORM / DB | Prisma + SQLite (DEV) |
| 언어 | TypeScript (프론트·백 공통) |
| 패키지 | pnpm workspace (모노레포) |
| 테스트 | Jest + Vitest + Playwright |

---

## 프로젝트 구조 (예정)

```
carmaint/
├── apps/
│   ├── web/          # Next.js 14 (App Router)
│   └── api/          # Nest.js
│       └── prisma/   # schema.prisma + seed.ts
├── packages/         # 공유 타입 (선택)
└── sdd/              # Software Delivery Documentation
    ├── PROJECT_STATUS.md        ← 전체 현황 요약
    ├── 00_sources/              # 원본 요구사항
    ├── 01_planning/             # 기능·화면·아키텍처·데이터·테스트 명세 ✅
    │   └── INDEX.md
    ├── 02_plan/                 # 실행 계획 (작성 중)
    ├── 03_build/                # 구현 현황
    ├── 04_verify/               # 검증 현황
    ├── 05_operate/              # 운영 기록
    └── 99_toolchain/
        └── seed_data/           # 코드 마스터 + 정비 주기 프리셋 데이터
```

---

## 주요 기능

- **차량 등록**: 차종·연료·변속기·연간 주행거리 입력 → 정비 주기 프리셋 자동 제안
- **정비 일정 계산**: km 기반(pkm) / 개월 기반(pmo) 교환 주기, 다음 예정일·상태 자동 산출
- **상태 분류**: urgent(90일 미만) / soon(90~179일) / ok(180일+) / chain(교환 불필요)
- **모바일 뷰**: 티켓 카드 목록, 상태별 색상(🔴🟡🟢), 바텀 시트 상세
- **태블릿+ 뷰**: 간트 차트(3년 타임라인) / 목록 테이블 탭 전환
- **교환완료 기록**: 패널·시트 내 인라인 날짜·km 입력

---

## 개발 현황

- **01_planning**: ✅ 완료 — AC 49개 확정 (V10 + M16 + VZ23)
- **02_plan**: ⏳ 다음 작업
- **03_build**: 🔲 미착수
- **04_verify**: 🔲 미착수

> 전체 현황: [`sdd/PROJECT_STATUS.md`](sdd/PROJECT_STATUS.md)

---

## 참고 자료

- 프로토타입: `D:\prj\hybrid_schedule_v2.html` (투싼 NX4 HEV 정비 일정 시각화)
- 명세 인덱스: [`sdd/01_planning/INDEX.md`](sdd/01_planning/INDEX.md)
- 시드 데이터: [`sdd/99_toolchain/seed_data/code_and_presets.md`](sdd/99_toolchain/seed_data/code_and_presets.md)
