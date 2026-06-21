# 메모리 복원 가이드 (Memory Restore Guide)

이 디렉터리(`.claude/memory/`)는 **Claude Code 자동 메모리의 버전 관리용 미러**다.
Claude Code가 실제로 읽고 쓰는 메모리는 이 repo 안이 아니라 사용자 홈의 다음 경로다:

```
~/.claude/projects/<project-slug>/memory/
```

`git pull` 후 이 미러를 위 실제 경로로 복사하면, 다른 PC에서도 동일한 메모리 컨텍스트
(사용자 배경·프로젝트 상태·UI 피드백·git 설정 등)를 그대로 복원할 수 있다.

---

## 1. project-slug 확인

slug는 **repo의 절대 경로**에서 영문/숫자가 아닌 문자(`:` `\` `/` `_`)를 모두 `-`로 치환해 만들어진다.

| 클론 위치 | slug |
|-----------|------|
| `c:\project\car_maintenance` (이 PC 기준) | `c--project-car-maintenance` |
| 예) `d:\work\car_maintenance` | `d--work-car-maintenance` |

> 확신이 안 서면, 프로젝트에서 Claude Code를 한 번 실행한 뒤
> `~/.claude/projects/` 아래 생성된 폴더명을 확인하면 된다.

---

## 2. 복원 명령

### Windows PowerShell

```powershell
# 클론 위치에 맞게 $slug 만 조정
$slug = "c--project-car-maintenance"
$dest = "$env:USERPROFILE\.claude\projects\$slug\memory"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
# SETUP.md(가이드)는 제외하고 메모리 파일만 복사
Get-ChildItem ".claude\memory\*.md" -Exclude "SETUP.md" | Copy-Item -Destination $dest -Force
Write-Host "복원 완료: $dest"
```

### Git Bash / macOS / Linux

```bash
slug="c--project-car-maintenance"
dest="$HOME/.claude/projects/$slug/memory"
mkdir -p "$dest"
# SETUP.md(가이드) 제외하고 복사
find .claude/memory -maxdepth 1 -name '*.md' ! -name 'SETUP.md' -exec cp {} "$dest/" \;
echo "복원 완료: $dest"
```

---

## 3. 메모리를 수정했을 때 (역방향 동기화)

세션 중 Claude가 메모리를 갱신하면 **실제 경로**가 최신이고 이 미러는 옛 버전이 된다.

### 자동 (pre-commit 훅) — 권장

이 repo에는 `.githooks/pre-commit` 훅이 포함돼 있어, **커밋할 때마다** 실제 메모리 경로를
`.claude/memory/`로 자동 복사하고 스테이징한다. (slug는 훅이 경로에서 자동 산출, SETUP.md는 제외)

클론 후 **한 번만** 훅 경로를 활성화하면 된다:

```bash
git config core.hooksPath .githooks
```

> 훅은 메모리 디렉터리가 없으면 조용히 통과하므로 CI·타 환경에서도 안전하다.

### 수동 (훅 미사용 시 폴백)

```powershell
# PowerShell
$slug = "c--project-car-maintenance"
$src = "$env:USERPROFILE\.claude\projects\$slug\memory"
Copy-Item "$src\*.md" -Destination ".claude\memory" -Force -Exclude "SETUP.md"
```

```bash
# Git Bash
slug="c--project-car-maintenance"
cp "$HOME/.claude/projects/$slug/memory/"*.md .claude/memory/
```

---

## 4. 포함된 메모리 파일

| 파일 | 내용 |
|------|------|
| `MEMORY.md` | 메모리 인덱스 (세션마다 자동 로드) |
| `user_background.md` | 사용자 개발 배경·학습 목표·주석 정책 |
| `project_state.md` | 프로젝트 단계·확정 결정·다음 작업 |
| `feedback_ui_design.md` | UI 디자인 피드백(상태색 표현 방식 등) |
| `project_env.md` | 로컬 git 설정 등 환경 정보 |
| `feedback_checklist_preservation.md` | 체크리스트 완료 처리 시 원문 보존 규칙 |

> ⚠️ `SETUP.md`(이 파일)는 가이드 문서이므로 실제 메모리 경로로 복사하지 않는다.
> 복사 명령에서 항상 제외한다.
