---
name: project-env
description: "carmaint 프로젝트 로컬 환경 설정 — git, PC 등"
metadata: 
  node_type: memory
  type: project
  originSessionId: 61731b91-7b2d-4f00-98f6-37cd91e0ccfd
---

## git 로컬 설정 (현 PC)

- `user.name`: changkeereum
- `user.email`: elien940318@gmail.com
- 설정 범위: `--local` (이 레포 전용, 2026-06-15 설정)
- 원격: `https://github.com/elien940318/car_maintenance.git` (master 브랜치)

**Why:** 이 PC는 git 전역 설정이 없었어서 커밋 시 identity 오류 발생. 레포 로컬 설정으로 해결.
**How to apply:** 커밋 전 `git config --local user.name` 으로 확인. 설정 누락 시 위 값으로 재설정.

[[project-state]]
