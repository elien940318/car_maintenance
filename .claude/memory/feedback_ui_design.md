---
name: feedback-ui-design
description: carmaint UI 디자인 피드백 — 상태 포인트 표현 방식 선호도
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 61731b91-7b2d-4f00-98f6-37cd91e0ccfd
---

상태(urgent/soon/ok/chain) 포인트 색상은 **배경 틴트(background tint) 대신 테두리(border stroke)와 텍스트 색**으로 표현할 것.

**Why:** 배경 틴트는 좌우 공간이 협소하고 색이 묻혀 구분감이 약하다는 피드백. 테두리+텍스트 방식이 다크 테마에서 포인트가 더 선명하게 살아남.

**How to apply:**
- 티켓 카드: 카드 배경은 `bg2` 중립색으로 통일, `card.strokes = solidFill(accentColor)`로 테두리, 부품명 텍스트에 상태 색 적용
- 배경 opacity tint(`{ r, g, b, a: 0.05~0.08 }`) 방식은 사용하지 않는다
- 카드 좌우 마진 16px, 카드 간 간격 8px, 모서리 radius 10px도 함께 유지할 것

[[project-state]]
