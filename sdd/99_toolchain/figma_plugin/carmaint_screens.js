// carmaint Figma 플러그인 — 화면 자동 생성
// 실행: Figma Desktop → Plugins → Development → Import plugin from manifest... → manifest.json 선택

(async () => {

  // ─────────────────────────────
  // 디자인 토큰
  // ─────────────────────────────
  const COLORS = {
    bg:      { r: 0.043, g: 0.059, b: 0.098 },   // #0b0f19
    bg2:     { r: 0.075, g: 0.098, b: 0.161 },   // #131929
    bg3:     { r: 0.102, g: 0.133, b: 0.208 },   // #1a2235
    border:  { r: 0.141, g: 0.184, b: 0.271 },   // #242f45
    text:    { r: 0.867, g: 0.894, b: 0.941 },   // #dde4f0
    muted:   { r: 0.420, g: 0.478, b: 0.600 },   // #6b7a99
    mint:    { r: 0.000, g: 0.898, b: 0.627 },   // #00e5a0
    cyan:    { r: 0.220, g: 0.741, b: 0.984 },   // #38bdf8
    amber:   { r: 0.984, g: 0.749, b: 0.141 },   // #fbbf24
    rose:    { r: 0.973, g: 0.443, b: 0.443 },   // #f87171
    purple:  { r: 0.655, g: 0.545, b: 0.980 },   // #a78bfa
    orange:  { r: 0.984, g: 0.573, b: 0.188 },   // #fb923c
    green:   { r: 0.133, g: 0.773, b: 0.369 },   // #22c55e
    white:   { r: 1,     g: 1,     b: 1     },
  };

  // ─────────────────────────────
  // 헬퍼
  // ─────────────────────────────
  function rgb(c, a = 1) {
    return { r: c.r, g: c.g, b: c.b, a };
  }

  function solidFill(color, opacity = 1) {
    return [{ type: 'SOLID', color, opacity }];
  }

  function setFont(node, size, weight = 400, color = COLORS.text) {
    node.fontSize = size;
    // Figma 내장 Inter의 세미볼드 정식 스타일명은 'Semi Bold'(띄어쓰기). 'SemiBold'로 쓰면 loadFontAsync가 reject되어 무한 로딩.
    node.fontName = { family: 'Inter', style: weight >= 700 ? 'Bold' : weight >= 600 ? 'Semi Bold' : weight >= 500 ? 'Medium' : 'Regular' };
    node.fills = solidFill(color);
  }

  async function loadFonts() {
    const fonts = ['Regular', 'Medium', 'Semi Bold', 'Bold'];
    for (const style of fonts) {
      await figma.loadFontAsync({ family: 'Inter', style });
    }
  }

  function createFrame(name, w, h, bgColor = COLORS.bg) {
    const f = figma.createFrame();
    f.name = name;
    f.resize(w, h);
    f.fills = solidFill(bgColor);
    f.clipsContent = true;
    return f;
  }

  function createRect(name, w, h, color, opacity = 1) {
    const r = figma.createRectangle();
    r.name = name;
    r.resize(w, h);
    r.fills = solidFill(color, opacity);
    return r;
  }

  function createText(content, size, weight, color, name = '') {
    const t = figma.createText();
    t.name = name || content.substring(0, 20);
    t.characters = content;
    setFont(t, size, weight, color);
    return t;
  }

  function place(node, parent, x, y) {
    parent.appendChild(node);
    node.x = x;
    node.y = y;
    return node;
  }

  function divider(parent, y, w, color = COLORS.border) {
    const line = createRect('Divider', w, 1, color);
    place(line, parent, 0, y);
    return line;
  }

  // ─────────────────────────────
  // 공통 컴포넌트
  // ─────────────────────────────

  // 헤더
  function buildHeader(parent, w, vehicleName = '내 투싼 · 2021 · HEV') {
    const header = createFrame('Header', w, 64, COLORS.bg2);
    place(header, parent, 0, 0);

    // 좌측: 앱명
    const appName = createText('carmaint', 16, 700, COLORS.mint, 'AppName');
    place(appName, header, 20, 12);

    // 차량 태그
    const tag = createText(vehicleName, 11, 500, COLORS.muted, 'VehicleTag');
    place(tag, header, 20, 36);

    // 우측: km
    const km = createText('89,660 km · 2026-06-14', 11, 400, COLORS.muted, 'KmBadge');
    place(km, header, w - 160, 36);

    divider(parent, 64, w);
    return header;
  }

  // 카테고리 섹션 레이블
  function buildSectionLabel(parent, label, color, x, y, w) {
    const g = figma.createFrame();
    g.name = `Section:${label}`;
    g.resize(w, 28);
    g.fills = [];
    g.clipsContent = false;
    place(g, parent, x, y);

    const dot = createRect('Dot', 4, 4, color);
    dot.cornerRadius = 2;
    place(dot, g, 0, 12);

    const labelT = createText(label, 11, 600, color);
    place(labelT, g, 12, 6);

    return g;
  }

  // 티켓 카드 (모바일)
  function buildTicketCard(parent, x, y, w, data) {
    const { partName, tag, status, dDay, cycle, nextDate, nextKm, lastDate } = data;

    // 상태별 포인트 컬러 — 배경 틴트 대신 테두리(stroke)와 부품명 텍스트에 사용
    const statusColors = {
      urgent: COLORS.rose,
      soon:   COLORS.amber,
      ok:     COLORS.green,
      chain:  COLORS.cyan,
    };
    const accent = statusColors[status];

    const cardH = lastDate ? 84 : 64;
    const card = figma.createFrame();
    card.name = `Card:${partName}`;
    card.resize(w, cardH);
    card.fills = solidFill(COLORS.bg2);   // 배경은 중립색으로 통일
    card.cornerRadius = 10;
    card.strokes = solidFill(accent);     // 포인트 ①: 상태 색 테두리
    card.strokeWeight = 1.5;
    card.strokeAlign = 'INSIDE';
    card.clipsContent = false;
    place(card, parent, x, y);

    // 1행: 부품명(포인트 ②: 상태 색 텍스트) + D-day
    const nameT = createText(partName + (tag ? `  [${tag}]` : ''), 14, 600, accent, 'PartName');
    place(nameT, card, 16, 16);

    const dDayText = status === 'chain' ? '교체 불필요' : `D${dDay > 0 ? '-' : '+'}${Math.abs(dDay)}`;
    const dDayColor = status === 'urgent' ? COLORS.rose : status === 'soon' ? COLORS.amber : status === 'ok' ? COLORS.muted : COLORS.cyan;
    const dDayT = createText(dDayText, 12, 500, dDayColor, 'DDay');
    place(dDayT, card, w - 80, 18);

    // 2행: 주기 → 다음 교환
    if (status !== 'chain') {
      const nextInfo = createText(`${cycle}  →  ${nextDate}  /  ${nextKm}`, 11, 400, COLORS.muted, 'NextInfo');
      place(nextInfo, card, 16, 38);
    } else {
      const chainT = createText('모니터링만 필요', 11, 400, COLORS.cyan, 'ChainInfo');
      place(chainT, card, 16, 38);
    }

    // 3행: 최근 교환
    if (lastDate && status !== 'chain') {
      const lastT = createText(`최근: ${lastDate}`, 10, 400, COLORS.muted, 'LastDate');
      place(lastT, card, 16, 60);
    }

    return card;
  }

  // 알림 카드 (태블릿+)
  function buildAlertCard(parent, x, y, data) {
    const { partName, status, daysLeft, nextDate } = data;
    const color = status === 'urgent' ? COLORS.rose : COLORS.amber;
    const label = status === 'urgent' ? '임박' : '주의';

    const card = figma.createFrame();
    card.name = `AlertCard:${partName}`;
    card.resize(200, 80);
    card.fills = solidFill(COLORS.bg2);
    card.cornerRadius = 8;
    card.clipsContent = false;
    place(card, parent, x, y);

    // 상단 3px 바
    const topBar = createRect('TopBar', 200, 3, color);
    place(topBar, card, 0, 0);

    // 배지
    const badge = createFrame('Badge', 36, 18, color);
    badge.cornerRadius = 4;
    place(badge, card, 12, 14);
    const badgeT = createText(label, 10, 600, COLORS.bg, 'BadgeText');
    place(badgeT, badge, 6, 3);

    // 부품명
    const nameT = createText(partName, 13, 600, COLORS.text, 'PartName');
    place(nameT, card, 12, 38);

    // 날짜
    const dateT = createText(`${nextDate} · ${daysLeft > 0 ? 'D-' + daysLeft : 'D+' + Math.abs(daysLeft)}일`, 11, 400, COLORS.muted, 'Date');
    place(dateT, card, 12, 58);

    return card;
  }

  // ─────────────────────────────
  // SCR-01 모바일 (375 × 812)
  // ─────────────────────────────
  function buildSCR01Mobile(parentPage) {
    const frame = createFrame('SCR-01 모바일 (375×812)', 375, 812);
    parentPage.appendChild(frame);
    frame.x = 0;
    frame.y = 0;

    // 헤더
    buildHeader(frame, 375);

    // 카테고리: 엔진·점화·구동계
    buildSectionLabel(frame, '엔진·점화·구동계', COLORS.mint, 16, 80, 343);

    let cardY = 112;
    const cards = [
      { partName: '엔진오일', tag: 'NX4', status: 'urgent', dDay: -7, cycle: '7,500km마다', nextDate: '2026-06-07 경과', nextKm: '89,485km', lastDate: '2025-12-07 · 82,000km' },
      { partName: '스파크플러그', tag: null, status: 'soon', dDay: 120, cycle: '60,000km마다', nextDate: '2026-10-14', nextKm: '96,000km', lastDate: '2025-03-01 · 55,000km' },
      { partName: '타이밍체인', tag: 'CHAIN', status: 'chain', dDay: 0, cycle: '—', nextDate: null, nextKm: null, lastDate: null },
      { partName: '에어클리너', tag: null, status: 'ok', dDay: 430, cycle: '40,000km마다', nextDate: '2027-09-15', nextKm: '120,000km', lastDate: '2024-06-01 · 65,000km' },
    ];

    for (const data of cards) {
      buildTicketCard(frame, 16, cardY, 343, data);
      cardY += (data.lastDate ? 84 : 64) + 8;
    }

    // 카테고리: 필터 & 공기
    buildSectionLabel(frame, '필터 & 공기', COLORS.orange, 16, cardY + 4, 343);
    cardY += 44;

    buildTicketCard(frame, 16, cardY, 343, {
      partName: '에어컨필터', tag: null, status: 'soon', dDay: 120, cycle: '6개월마다', nextDate: '2026-12-07', nextKm: '97,750km', lastDate: '2026-06-07',
    });
    cardY += 92;

    buildTicketCard(frame, 16, cardY, 343, {
      partName: '오일필터', tag: null, status: 'urgent', dDay: -7, cycle: '7,500km마다', nextDate: '2026-06-07 경과', nextKm: '89,485km', lastDate: '2025-12-07 · 82,000km',
    });

    return frame;
  }

  // ─────────────────────────────
  // SCR-01 태블릿+ (1024 × 768)
  // ─────────────────────────────
  function buildSCR01Tablet(parentPage) {
    const frame = createFrame('SCR-01 태블릿+ (1024×768)', 1024, 768);
    parentPage.appendChild(frame);
    frame.x = 420;
    frame.y = 0;

    // 헤더
    buildHeader(frame, 1024);

    // 뷰 탭
    const tabBg = createRect('TabBg', 1024, 44, COLORS.bg2);
    place(tabBg, frame, 0, 64);

    const ganttTab = createFrame('Tab:간트', 120, 36, COLORS.bg3);
    ganttTab.cornerRadius = 6;
    place(ganttTab, frame, 20, 68);
    const ganttT = createText('📊 간트 차트', 13, 600, COLORS.mint, 'GanttTabLabel');
    place(ganttT, ganttTab, 16, 9);

    const listTab = createFrame('Tab:목록', 120, 36, COLORS.bg);
    listTab.cornerRadius = 6;
    place(listTab, frame, 148, 68);
    const listT = createText('📋 목록 보기', 13, 400, COLORS.muted, 'ListTabLabel');
    place(listT, listTab, 16, 9);

    divider(frame, 108, 1024);

    // 알림 카드 섹션
    const alertLabel = createText('⚠️  긴급 알림', 12, 600, COLORS.rose, 'AlertLabel');
    place(alertLabel, frame, 20, 120);

    buildAlertCard(frame, 20, 144, { partName: '엔진오일', status: 'urgent', daysLeft: -7, nextDate: '2026-06-07' });
    buildAlertCard(frame, 232, 144, { partName: '오일필터', status: 'urgent', daysLeft: -7, nextDate: '2026-06-07' });
    buildAlertCard(frame, 444, 144, { partName: '에어컨필터', status: 'soon', daysLeft: 120, nextDate: '2026-12-07' });

    divider(frame, 240, 1024);

    // 힌트 바
    const hintT = createText('💡 항목을 클릭하면 상세 정보와 교환완료 입력 창이 열립니다', 11, 400, COLORS.muted, 'HintBar');
    place(hintT, frame, 20, 252);

    divider(frame, 272, 1024);

    // 간트 차트 영역
    buildGanttChart(frame, 20, 288, 984, 460);

    return frame;
  }

  // 간트 차트 (단순화 버전)
  function buildGanttChart(parent, x, y, w, h) {
    const gantt = createFrame('GanttChart', w, h, COLORS.bg2);
    gantt.cornerRadius = 8;
    place(gantt, parent, x, y);

    const MONTH_W = 64;
    const ROW_H   = 40;
    const LABEL_W = 140;
    const HEADER_H = 32;

    // TODAY 마커 (6번째 월 = 오늘 기준 1.5개월 후 위치)
    const todayX = LABEL_W + MONTH_W * 5 + 16;

    // 월 헤더
    const months = ['2025-08', '09', '10', '11', '12', '2026-01', '02', '03', '04', '05', '06 TODAY', '07', '08', '09'];
    months.forEach((m, i) => {
      const mT = createText(m, 9, 400, i === 10 ? COLORS.mint : COLORS.muted, `Month:${m}`);
      place(mT, gantt, LABEL_W + i * MONTH_W + 4, 8);
    });

    // TODAY 수직선
    const todayLine = createRect('TodayLine', 2, h - HEADER_H, COLORS.mint, 0.6);
    place(todayLine, gantt, todayX, HEADER_H);
    const todayLabel = createText('TODAY', 8, 700, COLORS.mint, 'TodayLabel');
    place(todayLabel, gantt, todayX - 14, h - 16);

    divider(gantt, HEADER_H, w, COLORS.border);

    // 정비 항목 행
    const rows = [
      { name: '엔진오일',     cat: 'engine', color: COLORS.mint,   doneW: 5,  nextW: 0.2, futW: 3.5 },
      { name: '오일필터',     cat: 'engine', color: COLORS.mint,   doneW: 5,  nextW: 0.2, futW: 3.5 },
      { name: '스파크플러그', cat: 'engine', color: COLORS.mint,   doneW: 14, nextW: 4,   futW: 8   },
      { name: '타이밍체인',   cat: 'chain',  color: COLORS.cyan,   doneW: 14, nextW: -1,  futW: -1  },
      { name: '에어클리너',   cat: 'filter', color: COLORS.orange, doneW: 10, nextW: 14,  futW: 14  },
      { name: '에어컨필터',   cat: 'filter', color: COLORS.orange, doneW: 6,  nextW: 4,   futW: 6   },
      { name: '변속기오일',   cat: 'trans',  color: COLORS.purple, doneW: 4,  nextW: 12,  futW: 12  },
      { name: '브레이크패드', cat: 'brake',  color: COLORS.rose,   doneW: 8,  nextW: 8,   futW: 12  },
    ];

    rows.forEach((row, i) => {
      const rowY = HEADER_H + i * ROW_H;
      const rowBg = createRect(`RowBg:${row.name}`, w, ROW_H, COLORS.bg3, i % 2 === 0 ? 0.3 : 0);
      place(rowBg, gantt, 0, rowY);

      // 부품명
      const nameT = createText(row.name, 11, 500, COLORS.text, `RowName:${row.name}`);
      place(nameT, gantt, 8, rowY + 12);

      if (row.nextW === -1) {
        // chain 항목
        const chainBar = createRect(`ChainBar:${row.name}`, w - LABEL_W - 16, ROW_H - 8, row.color, 0.08);
        chainBar.cornerRadius = 4;
        place(chainBar, gantt, LABEL_W + 8, rowY + 4);
        const chainT = createText('교체 불필요', 9, 400, row.color, 'ChainText');
        place(chainT, gantt, LABEL_W + (w - LABEL_W) / 2 - 30, rowY + 14);
      } else {
        // 완료 바
        const doneBar = createRect(`Done:${row.name}`, row.doneW * MONTH_W, ROW_H - 12, row.color, 0.25);
        doneBar.cornerRadius = 3;
        place(doneBar, gantt, LABEL_W, rowY + 6);

        // 다음 교환 바
        if (row.nextW > 0) {
          const nextBar = createRect(`Next:${row.name}`, row.nextW * MONTH_W, ROW_H - 8, row.color, 1);
          nextBar.cornerRadius = 3;
          place(nextBar, gantt, LABEL_W + row.doneW * MONTH_W, rowY + 4);
        }

        // 미래 바
        if (row.futW > 0) {
          const futBar = createRect(`Future:${row.name}`, row.futW * MONTH_W, ROW_H - 12, row.color, 0.12);
          futBar.cornerRadius = 3;
          place(futBar, gantt, LABEL_W + (row.doneW + row.nextW) * MONTH_W, rowY + 6);
        }
      }

      // 행 구분선
      divider(gantt, rowY + ROW_H, w, COLORS.border);
    });

    return gantt;
  }

  // ─────────────────────────────
  // SCR-02 바텀 시트 (375 × 812)
  // ─────────────────────────────
  function buildSCR02BottomSheet(parentPage) {
    const frame = createFrame('SCR-02 바텀 시트 (375×812)', 375, 812);
    parentPage.appendChild(frame);
    frame.x = 0;
    frame.y = 860;

    // 배경 (흐린 대시보드)
    const bgOverlay = createRect('BgOverlay', 375, 812, COLORS.bg, 0.7);
    place(bgOverlay, frame, 0, 0);

    // 바텀 시트 패널
    const sheetH = 609; // max 75vh
    const sheet = createFrame('BottomSheet', 375, sheetH, COLORS.bg3);
    sheet.cornerRadius = 16;
    place(sheet, frame, 0, 812 - sheetH);

    // 드래그 핸들
    const handle = createRect('DragHandle', 40, 4, COLORS.border);
    handle.cornerRadius = 2;
    place(handle, sheet, 167, 12);

    // 카테고리 태그
    const catTag = createFrame('CatTag', 60, 22, COLORS.mint);
    catTag.cornerRadius = 4;
    catTag.opacity = 0.15;
    place(catTag, sheet, 20, 36);
    const catT = createText('ENGINE', 9, 700, COLORS.mint, 'CatTagText');
    place(catT, sheet, 32, 40);

    // 닫기 버튼
    const closeT = createText('✕', 16, 400, COLORS.muted, 'CloseBtn');
    place(closeT, sheet, 340, 36);

    // 부품명
    const partName = createText('엔진오일', 20, 700, COLORS.text, 'PartName');
    place(partName, sheet, 20, 64);
    const subName = createText('Engine Oil  ·  D+7  초과', 12, 400, COLORS.rose, 'SubName');
    place(subName, sheet, 20, 90);

    divider(sheet, 112, 375);

    // SVG 일러스트 영역 (플레이스홀더)
    const svgBox = createRect('SVG-Placeholder', 335, 120, COLORS.bg2, 0.8);
    svgBox.cornerRadius = 8;
    place(svgBox, sheet, 20, 124);
    const svgLabel = createText('부품 구조 SVG 일러스트', 12, 400, COLORS.muted, 'SVGLabel');
    place(svgLabel, sheet, 112, 178);

    // 역할 설명
    const roleTitle = createText('🔩 이 부품의 역할', 12, 600, COLORS.text, 'RoleTitle');
    place(roleTitle, sheet, 20, 260);
    const roleDesc = createText('엔진오일은 엔진 내부 부품의 마찰을 줄이고\n열을 식히며, 슬러지 침착을 방지합니다.', 11, 400, COLORS.muted, 'RoleDesc');
    place(roleDesc, sheet, 20, 280);

    // 교환 통계 그리드
    const statsY = 330;
    const statsData = [['교환 주기', '7,500 km'], ['다음 교환', '즉시 필요'], ['예상 km', '현재 초과'], ['남은 날짜', '-7일 초과']];
    statsData.forEach(([label, val], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cell = createFrame(`Stat:${label}`, 157, 44, COLORS.bg2);
      cell.cornerRadius = 6;
      place(cell, sheet, 20 + col * 167, statsY + row * 52);
      const labelT = createText(label, 9, 400, COLORS.muted, 'StatLabel');
      place(labelT, cell, 10, 8);
      const valColor = (val.includes('초과') || val.includes('즉시')) ? COLORS.rose : COLORS.text;
      const valT = createText(val, 12, 600, valColor, 'StatVal');
      place(valT, cell, 10, 24);
    });

    // 교환완료 입력 영역 (하단 고정)
    const inputAreaY = sheetH - 180;
    divider(sheet, inputAreaY, 375);

    const inputTitle = createText('✅  교환완료 기록', 13, 600, COLORS.text, 'InputTitle');
    place(inputTitle, sheet, 20, inputAreaY + 12);

    // 날짜 입력
    const dateInput = createFrame('DateInput', 335, 36, COLORS.bg2);
    dateInput.cornerRadius = 6;
    place(dateInput, sheet, 20, inputAreaY + 40);
    const dateLabel = createText('교환 날짜', 10, 400, COLORS.muted, 'DateLabel');
    place(dateLabel, dateInput, 12, 6);
    const dateVal = createText('2026-06-14', 12, 500, COLORS.text, 'DateVal');
    place(dateVal, dateInput, 12, 20);

    // km 입력
    const kmInput = createFrame('KmInput', 335, 36, COLORS.bg2);
    kmInput.cornerRadius = 6;
    place(kmInput, sheet, 20, inputAreaY + 84);
    const kmLabel = createText('교환 km', 10, 400, COLORS.muted, 'KmLabel');
    place(kmLabel, kmInput, 12, 6);
    const kmVal = createText('89,660', 12, 500, COLORS.text, 'KmVal');
    place(kmVal, kmInput, 12, 20);

    // 저장 버튼
    const saveBtn = createFrame('SaveBtn', 335, 44, COLORS.mint);
    saveBtn.cornerRadius = 8;
    place(saveBtn, sheet, 20, inputAreaY + 128);
    const saveBtnT = createText('저장하기', 14, 600, COLORS.bg, 'SaveBtnText');
    place(saveBtnT, saveBtn, 130, 12);

    return frame;
  }

  // ─────────────────────────────
  // SCR-02 사이드 패널 (1024 × 768)
  // ─────────────────────────────
  function buildSCR02SidePanel(parentPage) {
    const frame = createFrame('SCR-02 사이드 패널 (1024×768)', 1024, 768);
    parentPage.appendChild(frame);
    frame.x = 420;
    frame.y = 860;

    // 배경 (흐린 대시보드)
    const bgOverlay = createRect('BgOverlay', 1024, 768, COLORS.bg, 0.5);
    place(bgOverlay, frame, 0, 0);

    // 오버레이 블러
    const blurRect = createRect('BlurOverlay', 1024, 768, COLORS.bg, 0.4);
    place(blurRect, frame, 0, 0);

    // 사이드 패널 (우측)
    const panelW = 360;
    const panel = createFrame('SidePanel', panelW, 768, COLORS.bg3);
    place(panel, frame, 1024 - panelW, 0);

    // 패널 헤더
    const panelHeader = createFrame('PanelHeader', panelW, 56, COLORS.bg2);
    place(panelHeader, panel, 0, 0);

    const catTag2 = createFrame('CatTag', 60, 22, COLORS.mint);
    catTag2.cornerRadius = 4;
    catTag2.opacity = 0.15;
    place(catTag2, panelHeader, 16, 17);
    const catT2 = createText('ENGINE', 9, 700, COLORS.mint, 'CatTagText');
    place(catT2, panelHeader, 28, 21);

    const partNameH = createText('엔진오일', 16, 700, COLORS.text, 'PartNameHeader');
    place(partNameH, panelHeader, 88, 12);
    const subNameH = createText('D+7  초과', 11, 500, COLORS.rose, 'SubNameHeader');
    place(subNameH, panelHeader, 88, 32);

    const closeBtn = createText('✕', 18, 400, COLORS.muted, 'CloseBtn');
    place(closeBtn, panelHeader, panelW - 32, 18);

    divider(panel, 56, panelW);

    // SVG 플레이스홀더
    const svgBox2 = createRect('SVG-Placeholder', panelW - 32, 100, COLORS.bg2, 0.8);
    svgBox2.cornerRadius = 8;
    place(svgBox2, panel, 16, 68);
    const svgLabel2 = createText('부품 구조 SVG 일러스트', 11, 400, COLORS.muted, 'SVGLabel');
    place(svgLabel2, panel, 90, 112);

    // 역할 설명
    const roleTitle2 = createText('🔩 이 부품의 역할', 12, 600, COLORS.text, 'RoleTitle');
    place(roleTitle2, panel, 16, 184);
    const roleDesc2 = createText('엔진오일은 엔진 내부 부품의 마찰을 줄이고\n열을 식히며, 슬러지 침착을 방지합니다.', 10, 400, COLORS.muted, 'RoleDesc');
    place(roleDesc2, panel, 16, 202);

    // 교환 통계
    const statsY2 = 250;
    const statsData2 = [['교환 주기', '7,500 km'], ['다음 교환', '즉시 필요'], ['예상 km', '현재 초과'], ['남은 날짜', '-7일 초과']];
    statsData2.forEach(([label, val], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cell = createFrame(`Stat:${label}`, 155, 44, COLORS.bg2);
      cell.cornerRadius = 6;
      place(cell, panel, 16 + col * 163, statsY2 + row * 52);
      const labelT = createText(label, 9, 400, COLORS.muted, 'StatLabel');
      place(labelT, cell, 10, 8);
      const valColor = (val.includes('초과') || val.includes('즉시')) ? COLORS.rose : COLORS.text;
      const valT = createText(val, 11, 600, valColor, 'StatVal');
      place(valT, cell, 10, 24);
    });

    // 정비 팁
    const tipY = 368;
    const tipBox = createRect('TipBg', panelW - 32, 48, COLORS.amber, 0.08);
    tipBox.cornerRadius = 6;
    place(tipBox, panel, 16, tipY);
    const tipT = createText('💡 HEV 차량은 회생제동으로 엔진오일 오염이\n빠를 수 있어 5,000~7,500km마다 점검 권장', 10, 400, COLORS.amber, 'TipText');
    place(tipT, panel, 28, tipY + 8);

    // 교환완료 입력 영역 (하단 고정)
    const inputAreaY2 = 768 - 196;
    divider(panel, inputAreaY2, panelW);

    const inputTitle2 = createText('✅  교환완료 기록', 12, 600, COLORS.text, 'InputTitle');
    place(inputTitle2, panel, 16, inputAreaY2 + 12);

    const dateInput2 = createFrame('DateInput', panelW - 32, 34, COLORS.bg2);
    dateInput2.cornerRadius = 6;
    place(dateInput2, panel, 16, inputAreaY2 + 40);
    const dateLabel2 = createText('교환 날짜', 9, 400, COLORS.muted, 'DateLabel');
    place(dateLabel2, dateInput2, 12, 5);
    const dateVal2 = createText('2026-06-14', 11, 500, COLORS.text, 'DateVal');
    place(dateVal2, dateInput2, 12, 18);

    const kmInput2 = createFrame('KmInput', panelW - 32, 34, COLORS.bg2);
    kmInput2.cornerRadius = 6;
    place(kmInput2, panel, 16, inputAreaY2 + 82);
    const kmLabel2 = createText('교환 km', 9, 400, COLORS.muted, 'KmLabel');
    place(kmLabel2, kmInput2, 12, 5);
    const kmVal2 = createText('89,660', 11, 500, COLORS.text, 'KmVal');
    place(kmVal2, kmInput2, 12, 18);

    const saveBtn2 = createFrame('SaveBtn', panelW - 32, 42, COLORS.mint);
    saveBtn2.cornerRadius = 8;
    place(saveBtn2, panel, 16, inputAreaY2 + 124);
    const saveBtnT2 = createText('저장하기', 13, 600, COLORS.bg, 'SaveBtnText');
    place(saveBtnT2, saveBtn2, 120, 12);

    return frame;
  }

  // ─────────────────────────────
  // SCR-03 공통: 헤더 + 스텝 인디케이터 셸
  // activeStep: 0=기본정보, 1=제원선택, 2=주행정보, 3=프리셋확인
  // ─────────────────────────────
  function buildSCR03Shell(parentPage, frameName, activeStep, px, py) {
    const frame = createFrame(frameName, 375, 812);
    parentPage.appendChild(frame);
    frame.x = px;
    frame.y = py;

    const headerF = createFrame('Header', 375, 56, COLORS.bg2);
    place(headerF, frame, 0, 0);
    place(createText('←', 18, 400, COLORS.text, 'Back'), headerF, 16, 16);
    place(createText('차량 등록', 16, 700, COLORS.text, 'HeaderTitle'), headerF, 147, 16);
    divider(frame, 56, 375);

    const stepLabels = ['기본 정보', '제원 선택', '주행 정보', '프리셋 확인'];
    const stepW = 375 / 4;
    stepLabels.forEach((s, i) => {
      const isDone   = i < activeStep;
      const isActive = i === activeStep;

      // 상단 진행 바
      const bar = createRect(`StepBar:${i}`, stepW - 4, 3, (isDone || isActive) ? COLORS.mint : COLORS.border);
      place(bar, frame, i * stepW + 2, 56);

      // 스텝 원
      const dot = createRect(`StepDot:${i}`, 20, 20, isActive ? COLORS.mint : COLORS.bg2);
      dot.cornerRadius = 10;
      if (isDone) {
        dot.strokes = solidFill(COLORS.mint);
        dot.strokeWeight = 1.5;
        dot.strokeAlign = 'INSIDE';
      }
      place(dot, frame, i * stepW + (stepW - 20) / 2, 64);

      // 숫자 / 완료 체크
      const numX = isDone
        ? i * stepW + (stepW - 8) / 2
        : i * stepW + (stepW - 6) / 2;
      place(createText(isDone ? '✓' : `${i + 1}`, 10, 700,
        isActive ? COLORS.bg : isDone ? COLORS.mint : COLORS.muted, `StepNum:${i}`), frame, numX, 68);

      // 라벨
      place(createText(s, 9, (isActive || isDone) ? 600 : 400,
        (isActive || isDone) ? COLORS.mint : COLORS.muted, `StepLabel:${i}`),
        frame, i * stepW + (stepW - 28) / 2, 90);
    });

    return { frame, contentY: 108 };
  }

  // ─────────────────────────────
  // SCR-03 Step 1 — 기본 정보 (375 × 812)
  // ─────────────────────────────
  function buildSCR03Step1(parentPage) {
    const { frame } = buildSCR03Shell(parentPage, 'SCR-03 Step1 기본정보 (375×812)', 0, 0, 1720);
    let y = 108;

    place(createText('Step 1 — 기본 정보를 입력하세요', 16, 700, COLORS.text, 'StepTitle'), frame, 20, y);
    y += 36;

    // 텍스트 입력 3개 (차량 별칭 / 모델명 / 차량번호)
    const textFields = [
      { label: '차량 별칭',   value: '내 투싼',            active: true  },
      { label: '차량 모델명', value: '투싼 NX4 하이브리드', active: false },
      { label: '차량번호',    value: '123가 4567',          active: false },
    ];
    for (const f of textFields) {
      place(createText(f.label, 11, 500, COLORS.muted, `Label:${f.label}`), frame, 20, y);
      y += 18;

      const input = createFrame(`Input:${f.label}`, 335, 48, COLORS.bg2);
      input.cornerRadius = 8;
      // 포커스 중인 필드는 mint 테두리
      input.strokes = solidFill(f.active ? COLORS.mint : COLORS.border);
      input.strokeWeight = f.active ? 1.5 : 1;
      input.strokeAlign = 'INSIDE';
      place(input, frame, 20, y);
      place(createText(f.value, 14, 400, COLORS.text, 'InputVal'), input, 14, 16);
      y += 56;
    }

    // 제조사(좌) + 연식(우) — 2열
    place(createText('제조사', 11, 500, COLORS.muted, 'Label:제조사'), frame, 20, y);
    place(createText('연식',   11, 500, COLORS.muted, 'Label:연식'),   frame, 193, y);
    y += 18;

    const mfrSel = createFrame('Select:제조사', 160, 48, COLORS.bg2);
    mfrSel.cornerRadius = 8;
    mfrSel.strokes = solidFill(COLORS.border);
    mfrSel.strokeWeight = 1;
    mfrSel.strokeAlign = 'INSIDE';
    place(mfrSel, frame, 20, y);
    place(createText('현대(Hyundai)', 13, 500, COLORS.text, 'SelectVal'), mfrSel, 12, 16);
    place(createText('▾', 13, 400, COLORS.muted, 'Arrow'), mfrSel, 134, 16);

    const yrSel = createFrame('Select:연식', 162, 48, COLORS.bg2);
    yrSel.cornerRadius = 8;
    yrSel.strokes = solidFill(COLORS.border);
    yrSel.strokeWeight = 1;
    yrSel.strokeAlign = 'INSIDE';
    place(yrSel, frame, 193, y);
    place(createText('2021년', 14, 500, COLORS.text, 'SelectVal'), yrSel, 12, 16);
    place(createText('▾', 13, 400, COLORS.muted, 'Arrow'), yrSel, 132, 16);
    y += 56;

    // 다음 버튼 (단일)
    const nextBtn = createFrame('NextBtn', 335, 48, COLORS.mint);
    nextBtn.cornerRadius = 10;
    place(nextBtn, frame, 20, 752);
    place(createText('다음 — 제원 선택', 15, 700, COLORS.bg, 'BtnText'), nextBtn, 106, 14);

    return frame;
  }

  // ─────────────────────────────
  // SCR-03 Step 2 — 제원 선택 (375 × 812)
  // ─────────────────────────────
  function buildSCR03Step2(parentPage) {
    const { frame } = buildSCR03Shell(parentPage, 'SCR-03 Step2 제원선택 (375×812)', 1, 420, 1720);
    let y = 108;

    place(createText('Step 2 — 제원을 선택해주세요', 16, 700, COLORS.text, 'StepTitle'), frame, 20, y);
    y += 36;

    const selFields = [
      { label: '차종', value: '중형 SUV' },
      { label: '연료', value: '하이브리드(HEV)' },
      { label: '변속기', value: '자동변속기(AT)' },
    ];
    for (const f of selFields) {
      place(createText(f.label, 11, 500, COLORS.muted, `Label:${f.label}`), frame, 20, y);
      y += 18;

      const sel = createFrame(`Select:${f.label}`, 335, 48, COLORS.bg2);
      sel.cornerRadius = 8;
      sel.strokes = solidFill(COLORS.border);
      sel.strokeWeight = 1;
      sel.strokeAlign = 'INSIDE';
      place(sel, frame, 20, y);
      place(createText(f.value, 14, 500, COLORS.text, 'SelectVal'), sel, 16, 16);
      place(createText('▾', 14, 400, COLORS.muted, 'Arrow'), sel, 308, 16);
      y += 56;
    }

    divider(frame, y + 8, 375);
    y += 24;

    // 프리셋 자동 적용 안내
    const infoBox = createRect('InfoBg', 335, 52, COLORS.mint, 0.07);
    infoBox.cornerRadius = 8;
    place(infoBox, frame, 20, y);
    place(createText('💡 선택한 제원(HEV · AT)으로\n정비 주기 프리셋 17항목이 Step 4에서 자동 제안됩니다.', 10, 400, COLORS.mint, 'InfoText'), frame, 34, y + 8);

    // 이전 / 다음 버튼
    const prevBtn = createFrame('PrevBtn', 160, 48, COLORS.bg3);
    prevBtn.cornerRadius = 10;
    prevBtn.strokes = solidFill(COLORS.border);
    prevBtn.strokeWeight = 1;
    prevBtn.strokeAlign = 'INSIDE';
    place(prevBtn, frame, 20, 752);
    place(createText('← 이전', 14, 500, COLORS.muted, 'BtnText'), prevBtn, 52, 15);

    const nextBtn = createFrame('NextBtn', 163, 48, COLORS.mint);
    nextBtn.cornerRadius = 10;
    place(nextBtn, frame, 192, 752);
    place(createText('다음 →', 14, 700, COLORS.bg, 'BtnText'), nextBtn, 54, 15);

    return frame;
  }

  // ─────────────────────────────
  // SCR-03 Step 3 — 주행 정보 (375 × 812)
  // ─────────────────────────────
  function buildSCR03Step3(parentPage) {
    const { frame } = buildSCR03Shell(parentPage, 'SCR-03 Step3 주행정보 (375×812)', 2, 840, 1720);
    let y = 108;

    place(createText('Step 3 — 주행 정보를 입력하세요', 16, 700, COLORS.text, 'StepTitle'), frame, 20, y);
    y += 36;

    // 현재 주행거리 (포커스 상태)
    place(createText('현재 주행거리 (km)', 11, 500, COLORS.muted, 'Label:현재km'), frame, 20, y);
    y += 18;
    const odoInput = createFrame('Input:현재km', 335, 52, COLORS.bg2);
    odoInput.cornerRadius = 8;
    odoInput.strokes = solidFill(COLORS.mint);
    odoInput.strokeWeight = 1.5;
    odoInput.strokeAlign = 'INSIDE';
    place(odoInput, frame, 20, y);
    place(createText('89,660', 22, 600, COLORS.text, 'KmVal'), odoInput, 14, 14);
    place(createText('km', 12, 400, COLORS.muted, 'KmUnit'), odoInput, 298, 19);
    y += 60;

    // 연간 주행거리
    place(createText('연간 주행거리 (km/년)', 11, 500, COLORS.muted, 'Label:연간km'), frame, 20, y);
    y += 18;
    const annInput = createFrame('Input:연간km', 335, 52, COLORS.bg2);
    annInput.cornerRadius = 8;
    annInput.strokes = solidFill(COLORS.border);
    annInput.strokeWeight = 1;
    annInput.strokeAlign = 'INSIDE';
    place(annInput, frame, 20, y);
    place(createText('18,000', 22, 600, COLORS.text, 'AnnVal'), annInput, 14, 14);
    place(createText('km/년', 12, 400, COLORS.muted, 'AnnUnit'), annInput, 278, 19);
    y += 60;

    // 월평균 파생값 안내 박스
    const derivedBox = createFrame('Derived', 335, 36, COLORS.bg3);
    derivedBox.cornerRadius = 6;
    place(derivedBox, frame, 20, y);
    place(createText('→  월평균', 11, 400, COLORS.muted, 'DerivedLabel'), derivedBox, 14, 10);
    place(createText('1,500 km / 월', 12, 600, COLORS.mint, 'DerivedVal'), derivedBox, 84, 9);
    place(createText('(연간 ÷ 12, 교환 시기 계산에 사용)', 9, 400, COLORS.muted, 'DerivedNote'), derivedBox, 204, 11);
    y += 48;

    // 최초 등록일
    place(createText('최초 등록일', 11, 500, COLORS.muted, 'Label:등록일'), frame, 20, y);
    y += 18;
    const dateInput = createFrame('Input:등록일', 335, 48, COLORS.bg2);
    dateInput.cornerRadius = 8;
    dateInput.strokes = solidFill(COLORS.border);
    dateInput.strokeWeight = 1;
    dateInput.strokeAlign = 'INSIDE';
    place(dateInput, frame, 20, y);
    place(createText('2021 - 01 - 15', 14, 500, COLORS.text, 'DateVal'), dateInput, 14, 16);
    place(createText('📅', 14, 400, COLORS.muted, 'CalIcon'), dateInput, 300, 16);
    y += 60;

    // 안내 박스
    const infoBox = createRect('InfoBg', 335, 48, COLORS.amber, 0.07);
    infoBox.cornerRadius = 8;
    place(infoBox, frame, 20, y);
    place(createText('💡 정확한 교환 시기 계산을 위해 실제\n현재 주행거리를 km 단위로 입력하세요.', 10, 400, COLORS.amber, 'InfoText'), frame, 34, y + 8);

    // 이전 / 다음 버튼
    const prevBtn3 = createFrame('PrevBtn', 160, 48, COLORS.bg3);
    prevBtn3.cornerRadius = 10;
    prevBtn3.strokes = solidFill(COLORS.border);
    prevBtn3.strokeWeight = 1;
    prevBtn3.strokeAlign = 'INSIDE';
    place(prevBtn3, frame, 20, 752);
    place(createText('← 이전', 14, 500, COLORS.muted, 'BtnText'), prevBtn3, 52, 15);

    const nextBtn3 = createFrame('NextBtn', 163, 48, COLORS.mint);
    nextBtn3.cornerRadius = 10;
    place(nextBtn3, frame, 192, 752);
    place(createText('다음 →', 14, 700, COLORS.bg, 'BtnText'), nextBtn3, 54, 15);

    return frame;
  }

  // ─────────────────────────────
  // SCR-03 Step 4 — 프리셋 확인 (375 × 812)
  // ─────────────────────────────
  function buildSCR03Step4(parentPage) {
    const { frame } = buildSCR03Shell(parentPage, 'SCR-03 Step4 프리셋확인 (375×812)', 3, 1260, 1720);
    let y = 108;

    place(createText('Step 4 — 프리셋을 확인하세요', 16, 700, COLORS.text, 'StepTitle'), frame, 20, y);
    y += 28;

    // 제원 요약 칩 (차종 / 연료 / 변속기)
    const specs   = ['중형 SUV', 'HEV', '자동(AT)'];
    const chipClr = [COLORS.purple, COLORS.mint, COLORS.cyan];
    let chipX = 20;
    for (let i = 0; i < specs.length; i++) {
      const chip = createFrame(`Chip:${specs[i]}`, 76, 24, COLORS.bg3);
      chip.cornerRadius = 12;
      chip.strokes = solidFill(chipClr[i]);
      chip.strokeWeight = 1;
      chip.strokeAlign = 'INSIDE';
      place(chip, frame, chipX, y);
      place(createText(specs[i], 10, 600, chipClr[i], 'ChipText'), chip, 10, 6);
      chipX += 84;
    }
    y += 36;

    place(createText('NX4 HEV · AT 제원 기준 — 17항목 자동 적용', 10, 400, COLORS.muted, 'SubNote'), frame, 20, y);
    y += 18;
    divider(frame, y, 375);
    y += 10;

    // 프리셋 목록 (11개 주요 항목)
    const presets4 = [
      { name: '엔진오일',        period: '7,500 km',    on: true,  color: COLORS.mint   },
      { name: '오일필터',        period: '7,500 km',    on: true,  color: COLORS.mint   },
      { name: '스파크플러그',    period: '60,000 km',   on: true,  color: COLORS.mint   },
      { name: '타이밍체인',      period: '교환 불필요', on: true,  color: COLORS.cyan   },
      { name: '타이밍벨트',      period: 'HEV 해당없음',on: false, color: COLORS.muted  },
      { name: '에어클리너',      period: '40,000 km',   on: true,  color: COLORS.orange },
      { name: '에어컨필터',      period: '6개월',       on: true,  color: COLORS.orange },
      { name: '변속기오일',      period: '60,000 km',   on: true,  color: COLORS.purple },
      { name: '브레이크액',      period: '2년',         on: true,  color: COLORS.rose   },
      { name: '브레이크패드(전)', period: '40,000 km',  on: true,  color: COLORS.rose   },
      { name: '브레이크패드(후)', period: '60,000 km',  on: true,  color: COLORS.rose   },
    ];

    for (const p of presets4) {
      if (y + 40 > 736) break; // 버튼 영역 침범 방지
      const row = createFrame(`PresetRow:${p.name}`, 335, 40, COLORS.bg2);
      row.cornerRadius = 6;
      if (!p.on) row.opacity = 0.4;
      place(row, frame, 20, y);

      // 체크 / 취소 마크
      place(createText(p.on ? '✓' : '✕', 11, 700, p.on ? p.color : COLORS.muted, 'Check'), row, 12, 14);

      // 부품명 — on 상태는 상태 컬러로, off는 muted
      place(createText(p.name, 12, p.on ? 500 : 400, p.on ? COLORS.text : COLORS.muted, 'PartName'), row, 32, 13);

      // 교환 주기
      place(createText(p.period, 11, 400, COLORS.muted, 'Period'), row, 210, 14);

      // 상태 색상 도트
      if (p.on) {
        const dot = createRect('AccentDot', 4, 4, p.color);
        dot.cornerRadius = 2;
        place(dot, row, 320, 18);
      }

      y += 46;
    }

    // 이전 / 완료 버튼
    const prevBtn4 = createFrame('PrevBtn', 160, 48, COLORS.bg3);
    prevBtn4.cornerRadius = 10;
    prevBtn4.strokes = solidFill(COLORS.border);
    prevBtn4.strokeWeight = 1;
    prevBtn4.strokeAlign = 'INSIDE';
    place(prevBtn4, frame, 20, 752);
    place(createText('← 이전', 14, 500, COLORS.muted, 'BtnText'), prevBtn4, 52, 15);

    const doneBtn = createFrame('DoneBtn', 163, 48, COLORS.mint);
    doneBtn.cornerRadius = 10;
    place(doneBtn, frame, 192, 752);
    place(createText('완료 등록', 14, 700, COLORS.bg, 'BtnText'), doneBtn, 42, 15);

    return frame;
  }

  // ─────────────────────────────
  // SCR-01 빈 상태 (375 × 812)
  // ─────────────────────────────
  function buildEmptyState(parentPage) {
    const frame = createFrame('SCR-01 빈 상태 (375×812)', 375, 812);
    parentPage.appendChild(frame);
    // SCR-03 Step2(x=420)와 겹치지 않도록 Step4(x=1260+375=1635) 우측에 배치
    frame.x = 1680;
    frame.y = 1720;

    // 헤더 (최소)
    const headerF = createFrame('Header', 375, 56, COLORS.bg2);
    place(headerF, frame, 0, 0);
    const appNameE = createText('carmaint', 18, 700, COLORS.mint, 'AppName');
    place(appNameE, headerF, 20, 16);
    divider(frame, 56, 375);

    // 빈 상태 콘텐츠 (중앙)
    const iconT = createText('🚗', 64, 400, COLORS.text, 'CarIcon');
    place(iconT, frame, 148, 280);

    const msg1 = createText('차량 정보를 먼저 등록해주세요.', 16, 600, COLORS.text, 'Msg1');
    place(msg1, frame, 68, 380);

    const msg2 = createText('제원을 입력하면 교환 일정이\n자동으로 계산됩니다.', 13, 400, COLORS.muted, 'Msg2');
    place(msg2, frame, 90, 412);
    msg2.textAlignHorizontal = 'CENTER';

    const cta = createFrame('CTABtn', 240, 52, COLORS.mint);
    cta.cornerRadius = 10;
    place(cta, frame, 67, 476);
    const ctaT = createText('＋  차량 등록하기', 15, 700, COLORS.bg, 'CTAText');
    place(ctaT, cta, 60, 14);

    return frame;
  }

  // ─────────────────────────────
  // 메인 실행
  // ─────────────────────────────
  // try/catch로 감싸 어떤 에러든 closePlugin으로 종료시킨다.
  // (async IIFE의 미처리 rejection은 Figma가 잡지 못해 "Running…" 무한 로딩이 됨)
  try {
    await loadFonts();

    const page = figma.currentPage;
    page.name = 'carmaint UI';

    figma.viewport.zoom = 0.15;

    await buildSCR01Mobile(page);
    await buildSCR01Tablet(page);
    await buildSCR02BottomSheet(page);
    await buildSCR02SidePanel(page);
    await buildSCR03Step1(page);
    await buildSCR03Step2(page);
    await buildSCR03Step3(page);
    await buildSCR03Step4(page);
    await buildEmptyState(page);

    figma.viewport.scrollAndZoomIntoView(page.children);

    figma.notify('✅ carmaint 화면 9개 생성 완료!', { timeout: 3000 });
    figma.closePlugin();
  } catch (e) {
    figma.notify('❌ 생성 실패: ' + (e && e.message ? e.message : String(e)), { error: true, timeout: 5000 });
    figma.closePlugin('생성 실패: ' + (e && e.message ? e.message : String(e)));
  }

})();
