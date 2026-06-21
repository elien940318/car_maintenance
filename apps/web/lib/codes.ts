export const VEHICLE_TYPES = [
  { code: 'micro', label_ko: '경차' },
  { code: 'small', label_ko: '소형' },
  { code: 'mid', label_ko: '중형' },
  { code: 'large', label_ko: '대형' },
  { code: 'mini_suv', label_ko: '소형 SUV' },
  { code: 'mid_suv', label_ko: '중형 SUV' },
  { code: 'large_suv', label_ko: '대형 SUV' },
  { code: 'van', label_ko: '미니밴' },
  { code: 'mpv', label_ko: '다목적' },
  { code: 'pickup', label_ko: '픽업트럭' },
];

export const FUEL_TYPES = [
  { code: 'gasoline', label_ko: '가솔린' },
  { code: 'diesel', label_ko: '디젤' },
  { code: 'lpg', label_ko: 'LPG' },
  { code: 'hev', label_ko: '하이브리드(HEV)' },
  { code: 'phev', label_ko: '플러그인 하이브리드(PHEV)' },
  { code: 'ev', label_ko: '전기(EV)' },
];

export const TRANSMISSION_TYPES = [
  { code: 'at', label_ko: '자동변속기(AT)' },
  { code: 'mt', label_ko: '수동변속기(MT)' },
  { code: 'dct_wet', label_ko: 'DCT 습식' },
  { code: 'dct_dry', label_ko: 'DCT 건식' },
  { code: 'cvt', label_ko: 'CVT' },
  { code: 'e_motor', label_ko: '전기모터' },
];

export const MANUFACTURERS = [
  { code: 'hyundai', label_ko: '현대(Hyundai)' },
  { code: 'kia', label_ko: '기아(Kia)' },
  { code: 'genesis', label_ko: '제네시스(Genesis)' },
  { code: 'chevrolet', label_ko: '쉐보레(Chevrolet)' },
  { code: 'ssangyong', label_ko: 'KGM(쌍용)' },
  { code: 'renault', label_ko: '르노코리아' },
  { code: 'other', label_ko: '기타' },
];

export const CATEGORY_GROUPS = [
  { label: '엔진·점화·구동계', categories: ['engine', 'chain'] },
  { label: '필터 & 공기', categories: ['filter'] },
  { label: '변속기', categories: ['trans'] },
  { label: '제동 & 타이어', categories: ['brake'] },
  { label: '냉각 & 하이브리드', categories: ['cooling', 'hybrid'] },
  { label: '현가 & 섀시', categories: ['suspension'] },
];

export const CATEGORY_COLORS: Record<string, string> = {
  engine: '#00e5a0',
  chain: '#38bdf8',
  filter: '#fb923c',
  trans: '#a78bfa',
  brake: '#f87171',
  cooling: '#fbbf24',
  hybrid: '#38bdf8',
  suspension: '#7c93c0',
};

export const STATUS_COLORS: Record<string, string> = {
  urgent: '#f87171',
  soon: '#fbbf24',
  ok: '#22c55e',
  chain: '#38bdf8',
  unknown: '#6b7a99',
};

export const STATUS_LABELS: Record<string, string> = {
  urgent: '임박',
  soon: '주의',
  ok: '여유',
  chain: '모니터링',
  unknown: '계산 불가',
};

export const STATUS_ICONS: Record<string, string> = {
  urgent: '🔴',
  soon: '🟡',
  ok: '🟢',
  chain: '',
  unknown: '⚪',
};
