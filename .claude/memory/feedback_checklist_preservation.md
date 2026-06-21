---
name: feedback-checklist-preservation
description: "체크리스트 완료 처리 시 원문 상세 내용 보존 — [ ] → [x] 변환만 허용"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 61731b91-7b2d-4f00-98f6-37cd91e0ccfd
---

체크리스트 항목을 완료 처리할 때는 `[ ]` → `[x]` 체크박스 변환만 수행한다. 하위 항목, 함수 시그니처, 설명 텍스트 등 기존 내용을 요약하거나 병합해서는 안 된다.

**Why:** 사용자가 Phase 2 완료 처리 시 상세한 ScheduleCalculator 함수 시그니처와 MaintenanceService 메서드 설명이 단 몇 줄로 압축된 것을 발견하고 원복을 요청함. "이전처럼 상세한 내용을 보존한 체 체크처리만 하면 될것같아" (2026-06-21)

**How to apply:** `sdd/02_plan/01_feature/` 내 md 파일의 Phase 완료 처리 시, 텍스트를 일절 수정하지 않고 `[ ]`만 `[x]`로 교체한다. 여러 서브 항목을 하나의 `[x]` 줄로 합치는 것은 금지.
