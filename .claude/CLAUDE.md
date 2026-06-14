# CLAUDE.md

## What This Is

자동차 부품별 정비 일정관리 서비스 `carmaint`의 Claude 실행 규칙과 하네스 위치를 설명하는 문서다.

## Environment Naming Policy

- 문서/대화/로그에서 실행 환경은 항상 `DEV(개발계)`로 표기한다.
- `local`, `localhost 환경` 같은 표현은 운영 용어로 사용하지 않는다.

## Harness Layout

```text
carmaint/
├── .agent/          # Ralph loop harness, PRD scaffold, run state
├── .agentic-dev/    # 프로젝트 계약 및 설정
├── .claude/         # Claude 설정
│   ├── agents/      # Claude role agents
│   └── skills/      # Claude Code repo-local skills
├── sdd/             # Software Delivery Documentation
│   ├── 00_sources/  # 원본 요구사항
│   ├── 01_planning/ # 기능/화면/아키텍처/데이터/API/테스트 명세
│   ├── 02_plan/     # 실행 계획 파일
│   ├── 03_build/    # 구현 현황 요약
│   ├── 03_verify/   # 검증 현황 요약
│   ├── 05_operate/  # 운영 기록
│   └── 99_toolchain/ # 자동화 스크립트
└── src/             # 애플리케이션 소스 (기술 스택 결정 후 생성)
```

## Working Rules

- 컨벤션과 실행 규칙의 정본은 `sdd/99_toolchain/02_policies`에 둔다.
- DEV 반영이 필요한 작업은 항상 `main push -> DEV 배포 -> DEV 검증` 순서를 따른다.
- `sdd/03_build`는 runtime assembly를 설명하는 current-state 문서이며 dated execution narrative를 남기지 않는다.

## Project Status

- **현재 단계**: 요구사항 분석 / SDD 01_planning 작성 중
- **기술 스택**: 미결정 (요구사항 분석 완료 후 결정 예정)
- **참고 프로토타입**: `D:\prj\hybrid_schedule_v2.html` (투싼 NX4 HEV 정비 일정 시각화 HTML)
