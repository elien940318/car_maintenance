# 99_toolchain

> 자동화 스크립트, 정책, 시드 데이터 등 SDD 보조 도구.

---

## figma_plugin — UI 화면 자동생성 플러그인 ✅

| 파일 | 역할 |
|------|------|
| `figma_plugin/manifest.json` | Figma 플러그인 진입점 |
| `figma_plugin/carmaint_screens.js` | 화면 9개 자동 생성 스크립트 |

### 생성 화면 목록

| 프레임 | 해상도 | 위치(x,y) |
|--------|--------|-----------|
| SCR-01 모바일 | 375×812 | 0, 0 |
| SCR-01 태블릿+ | 1024×768 | 420, 0 |
| SCR-02 바텀 시트 | 375×812 | 0, 860 |
| SCR-02 사이드 패널 | 1024×768 | 420, 860 |
| SCR-03 Step1 기본정보 | 375×812 | 0, 1720 |
| SCR-03 Step2 제원선택 | 375×812 | 420, 1720 |
| SCR-03 Step3 주행정보 | 375×812 | 840, 1720 |
| SCR-03 Step4 프리셋확인 | 375×812 | 1260, 1720 |
| SCR-01 빈 상태 | 375×812 | 420, 1720 (SCR-03 우측) |

### 실행 방법

```
Figma Desktop → Plugins → Development → Import plugin from manifest...
→ sdd/99_toolchain/figma_plugin/manifest.json 선택 후 실행
```

### 주요 구현 사항

- **디자인 토큰**: 다크 테마 (`--bg #0b0f19` 기준) + 상태 색상 4종 (urgent/soon/ok/chain)
- **티켓 카드 포인트**: 배경 틴트 제거 → **부품명 텍스트 색** + **카드 테두리 stroke**로 상태 표현
- **티켓 카드 여백**: 좌우 16px 마진, 카드 간격 8px, 모서리 radius 10px
- **SCR-03 4단계 화면**: 공통 셸(`buildSCR03Shell`) 추출 — 완료 스텝 ✓ 표시 + mint 테두리
- **폰트 로딩**: `Inter Semi Bold` (띄어쓰기 포함) 정식 스타일명 사용
- **에러 핸들링**: `try/catch` 래핑 → 실패 시 Figma 토스트로 원인 표시 후 `closePlugin`

---

## 예정 항목

| 파일 | 목적 |
|------|------|
| `01_automation/seed_parts.py` | 투싼 NX4 HEV 기본 정비 항목 17개 시드 데이터 |
| `01_automation/run_ui_parity.py` | UI parity 검증 자동화 (AC-VZ14) |
| `02_policies/` | 컨벤션 및 실행 정책 문서 |
