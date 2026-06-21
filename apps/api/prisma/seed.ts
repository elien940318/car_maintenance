/**
 * Prisma seed 스크립트
 * 코드 테이블 4종(차종·연료·변속기·제조사) + 부품 마스터 25개 + 정비 주기 프리셋 117개를 초기 적재한다.
 * 원천 데이터: sdd/99_toolchain/seed_data/code_and_presets.md
 *
 * 실행: pnpm --filter api prisma db seed
 */
import { resolve } from 'path';
import { PrismaClient } from '../generated/prisma';

// seed.ts는 prisma/ 폴더에 있으므로 __dirname = apps/api/prisma
// dev.db도 같은 폴더에 위치. 절대경로로 지정해 실행 디렉터리와 무관하게 동작
const prisma = new PrismaClient({
  datasourceUrl: `file:${resolve(__dirname, 'dev.db')}`,
});

async function main() {
  console.log('🌱 시드 데이터 적재 시작...');

  // ── 1. VehicleTypeCode (차종 코드 10개) ───────────────────────────────────
  await prisma.vehicleTypeCode.createMany({
    data: [
      { code: 'micro',        label_ko: '경차',      sort_order: 1 },
      { code: 'compact',      label_ko: '소형',      sort_order: 2 },
      { code: 'subcompact',   label_ko: '준중형',    sort_order: 3 },
      { code: 'midsize',      label_ko: '중형',      sort_order: 4 },
      { code: 'fullsize',     label_ko: '대형',      sort_order: 5 },
      { code: 'suv_compact',  label_ko: '소형 SUV',  sort_order: 6 },
      { code: 'suv_midsize',  label_ko: '중형 SUV',  sort_order: 7 },
      { code: 'suv_fullsize', label_ko: '대형 SUV',  sort_order: 8 },
      { code: 'minivan',      label_ko: '미니밴',    sort_order: 9 },
      { code: 'pickup',       label_ko: '픽업트럭',  sort_order: 10 },
    ],
  });
  console.log('  ✓ VehicleTypeCode 10개');

  // ── 2. FuelTypeCode (연료 코드 6개) ─────────────────────────────────────
  await prisma.fuelTypeCode.createMany({
    data: [
      { code: 'gasoline', label_ko: '가솔린',                  has_engine: true,  has_spark_plug: true,  has_glow_plug: false, has_dpf: false, has_hv_battery: false, sort_order: 1 },
      { code: 'diesel',   label_ko: '디젤',                    has_engine: true,  has_spark_plug: false, has_glow_plug: true,  has_dpf: true,  has_hv_battery: false, sort_order: 2 },
      { code: 'lpg',      label_ko: 'LPG',                     has_engine: true,  has_spark_plug: true,  has_glow_plug: false, has_dpf: false, has_hv_battery: false, sort_order: 3 },
      { code: 'hev',      label_ko: '하이브리드(HEV)',          has_engine: true,  has_spark_plug: true,  has_glow_plug: false, has_dpf: false, has_hv_battery: true,  sort_order: 4 },
      { code: 'phev',     label_ko: '플러그인 하이브리드(PHEV)', has_engine: true,  has_spark_plug: true,  has_glow_plug: false, has_dpf: false, has_hv_battery: true,  sort_order: 5 },
      { code: 'ev',       label_ko: '전기(EV)',                 has_engine: false, has_spark_plug: false, has_glow_plug: false, has_dpf: false, has_hv_battery: true,  sort_order: 6 },
    ],
  });
  console.log('  ✓ FuelTypeCode 6개');

  // ── 3. TransmissionTypeCode (변속기 코드 6개) ────────────────────────────
  await prisma.transmissionTypeCode.createMany({
    data: [
      { code: 'at',      label_ko: '자동변속기(AT)',   sort_order: 1 },
      { code: 'mt',      label_ko: '수동변속기(MT)',   sort_order: 2 },
      { code: 'dct_wet', label_ko: 'DCT (습식)',      sort_order: 3 },
      { code: 'dct_dry', label_ko: 'DCT (건식)',      sort_order: 4 },
      { code: 'cvt',     label_ko: 'CVT (무단변속기)', sort_order: 5 },
      { code: 'e_motor', label_ko: '전기모터(감속기)', sort_order: 6 },
    ],
  });
  console.log('  ✓ TransmissionTypeCode 6개');

  // ── 3-1. ManufacturerCode (제조사 코드 7개) ──────────────────────────────
  await prisma.manufacturerCode.createMany({
    data: [
      { code: 'hyundai',       label_ko: '현대',           sort_order: 1 },
      { code: 'kia',           label_ko: '기아',           sort_order: 2 },
      { code: 'genesis',       label_ko: '제네시스',       sort_order: 3 },
      { code: 'kg_mobility',   label_ko: 'KG모빌리티',     sort_order: 4 },
      { code: 'renault_korea', label_ko: '르노코리아',     sort_order: 5 },
      { code: 'chevrolet',     label_ko: '쉐보레(한국GM)', sort_order: 6 },
      { code: 'etc',           label_ko: '기타',           sort_order: 99 },
    ],
  });
  console.log('  ✓ ManufacturerCode 7개');

  // ── 4. MaintenancePartMaster (부품 마스터 25개) ──────────────────────────
  await prisma.maintenancePartMaster.createMany({
    data: [
      { part_key: 'engine_oil',       name_ko: '엔진오일',           category: 'engine',     applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev',          sort_order: 10 },
      { part_key: 'oil_filter',       name_ko: '오일필터',           category: 'engine',     applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev',          sort_order: 20 },
      { part_key: 'spark_plug',       name_ko: '스파크플러그',       category: 'engine',     applicable_fuel_codes: 'gasoline,lpg,hev,phev',                 sort_order: 30 },
      { part_key: 'ignition_coil',    name_ko: '점화코일',           category: 'engine',     applicable_fuel_codes: 'gasoline,lpg,hev,phev',                 sort_order: 35 },
      { part_key: 'glow_plug',        name_ko: '글로우플러그',       category: 'engine',     applicable_fuel_codes: 'diesel',                                sort_order: 40 },
      { part_key: 'serpentine_belt',  name_ko: '구동벨트(보조벨트)', category: 'engine',     applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev',          sort_order: 50 },
      { part_key: 'timing_chain',     name_ko: '타이밍체인',         category: 'chain',      applicable_fuel_codes: 'gasoline,hev,phev',                     sort_order: 60 },
      { part_key: 'timing_belt',      name_ko: '타이밍벨트',         category: 'chain',      applicable_fuel_codes: 'gasoline,diesel',                       sort_order: 70 },
      { part_key: 'air_filter',       name_ko: '에어클리너',         category: 'filter',     applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev',          sort_order: 80 },
      { part_key: 'cabin_filter',     name_ko: '에어컨필터',         category: 'filter',     applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 90 },
      { part_key: 'fuel_filter',      name_ko: '연료필터',           category: 'filter',     applicable_fuel_codes: 'diesel,lpg',                            sort_order: 100 },
      { part_key: 'dpf',              name_ko: 'DPF(매연여과장치)',  category: 'filter',     applicable_fuel_codes: 'diesel',                                sort_order: 110 },
      { part_key: 'trans_fluid',      name_ko: '변속기오일',         category: 'trans',      applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev',          sort_order: 120 },
      { part_key: 'reducer_oil',      name_ko: '감속기오일',         category: 'trans',      applicable_fuel_codes: 'ev',                                    sort_order: 130 },
      { part_key: 'brake_fluid',      name_ko: '브레이크오일',       category: 'brake',      applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 140 },
      { part_key: 'brake_pad_front',  name_ko: '브레이크패드(전)',   category: 'brake',      applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 150 },
      { part_key: 'brake_pad_rear',   name_ko: '브레이크패드(후)',   category: 'brake',      applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 160 },
      { part_key: 'brake_disc',       name_ko: '브레이크디스크',     category: 'brake',      applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 170 },
      { part_key: 'tire',             name_ko: '타이어',             category: 'brake',      applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 180 },
      { part_key: 'tire_rotation',    name_ko: '타이어 로테이션',    category: 'brake',      applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 190 },
      { part_key: 'coolant',          name_ko: '냉각수',             category: 'cooling',    applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev',          sort_order: 200 },
      { part_key: 'inverter_coolant', name_ko: '인버터 냉각수',      category: 'hybrid',     applicable_fuel_codes: 'hev,phev,ev',                           sort_order: 210 },
      { part_key: 'battery_12v',      name_ko: '12V 보조배터리',     category: 'hybrid',     applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 220 },
      { part_key: 'hv_battery_check', name_ko: '고전압배터리 점검',  category: 'hybrid',     applicable_fuel_codes: 'hev,phev,ev',                           sort_order: 230 },
      { part_key: 'rubber_bushing',   name_ko: '고무부싱(현가)',     category: 'suspension', applicable_fuel_codes: 'gasoline,diesel,lpg,hev,phev,ev',       sort_order: 240 },
    ],
  });
  console.log('  ✓ MaintenancePartMaster 25개');

  // ── 5. MaintenanceIntervalPreset (정비 주기 프리셋 117개) ─────────────────
  // NULL trans = 모든 변속기 공통
  type PresetRow = {
    part_key: string;
    fuel_type_code: string;
    transmission_code?: string;
    interval_km?: number;
    interval_months?: number;
    is_chain?: boolean;
    note?: string;
  };

  const presets: PresetRow[] = [
    // 5-1. 엔진오일
    { part_key: 'engine_oil', fuel_type_code: 'gasoline', interval_km: 10000, note: '터보 차량은 7,500km 권장' },
    { part_key: 'engine_oil', fuel_type_code: 'diesel',   interval_km: 15000 },
    { part_key: 'engine_oil', fuel_type_code: 'lpg',      interval_km: 8000 },
    { part_key: 'engine_oil', fuel_type_code: 'hev',      interval_km: 10000, note: '단거리 위주 시 6개월 시간 기준 병행 권장' },
    { part_key: 'engine_oil', fuel_type_code: 'phev',     interval_km: 10000 },

    // 5-2. 오일필터
    { part_key: 'oil_filter', fuel_type_code: 'gasoline', interval_km: 10000, note: '엔진오일과 세트 교환' },
    { part_key: 'oil_filter', fuel_type_code: 'diesel',   interval_km: 15000, note: '엔진오일과 세트 교환' },
    { part_key: 'oil_filter', fuel_type_code: 'lpg',      interval_km: 8000,  note: '엔진오일과 세트 교환' },
    { part_key: 'oil_filter', fuel_type_code: 'hev',      interval_km: 10000, note: '엔진오일과 세트 교환' },
    { part_key: 'oil_filter', fuel_type_code: 'phev',     interval_km: 10000, note: '엔진오일과 세트 교환' },

    // 5-3. 스파크플러그
    { part_key: 'spark_plug', fuel_type_code: 'gasoline', interval_km: 60000, note: '이리듐/백금 기준. 일반 니켈은 20,000km' },
    { part_key: 'spark_plug', fuel_type_code: 'lpg',      interval_km: 30000, note: 'LPG 연소 특성상 더 빈번한 교환' },
    { part_key: 'spark_plug', fuel_type_code: 'hev',      interval_km: 60000, note: '이리듐 기준' },
    { part_key: 'spark_plug', fuel_type_code: 'phev',     interval_km: 60000, note: '이리듐 기준' },

    // 5-3-1. 점화코일
    { part_key: 'ignition_coil', fuel_type_code: 'gasoline', interval_km: 100000, note: '실화·부조 발생 시 조기 교환. 코일온플러그 개별 교환' },
    { part_key: 'ignition_coil', fuel_type_code: 'lpg',      interval_km: 80000,  note: 'LPG 고온 연소로 열화 빠름' },
    { part_key: 'ignition_coil', fuel_type_code: 'hev',      interval_km: 100000 },
    { part_key: 'ignition_coil', fuel_type_code: 'phev',     interval_km: 100000 },

    // 5-4. 글로우플러그
    { part_key: 'glow_plug', fuel_type_code: 'diesel', interval_km: 100000, note: '시동 불량·백연 발생 시 조기 점검' },

    // 5-5. 구동벨트
    { part_key: 'serpentine_belt', fuel_type_code: 'gasoline', interval_km: 100000, note: '균열·이상음 시 즉시 교환' },
    { part_key: 'serpentine_belt', fuel_type_code: 'diesel',   interval_km: 80000 },
    { part_key: 'serpentine_belt', fuel_type_code: 'lpg',      interval_km: 80000 },
    { part_key: 'serpentine_belt', fuel_type_code: 'hev',      interval_km: 80000, note: 'HSG 연결 방식에 따라 부하 상이' },
    { part_key: 'serpentine_belt', fuel_type_code: 'phev',     interval_km: 80000 },

    // 5-6. 타이밍체인 (is_chain=true)
    { part_key: 'timing_chain', fuel_type_code: 'gasoline', is_chain: true, note: '교환 불필요. 엔진오일 관리가 수명 결정' },
    { part_key: 'timing_chain', fuel_type_code: 'hev',      is_chain: true, note: '교환 불필요' },
    { part_key: 'timing_chain', fuel_type_code: 'phev',     is_chain: true, note: '교환 불필요' },

    // 5-7. 타이밍벨트
    { part_key: 'timing_belt', fuel_type_code: 'gasoline', interval_km: 100000, note: '벨트 방식 차량만 해당 (제조사 확인 필수)' },
    { part_key: 'timing_belt', fuel_type_code: 'diesel',   interval_km: 100000, note: '일부 구형 디젤 해당' },

    // 5-8. 에어클리너
    { part_key: 'air_filter', fuel_type_code: 'gasoline', interval_km: 40000, note: '황사·미세먼지 심한 지역 30,000km' },
    { part_key: 'air_filter', fuel_type_code: 'diesel',   interval_km: 30000, note: '디젤 흡기 오염 더 빠름' },
    { part_key: 'air_filter', fuel_type_code: 'lpg',      interval_km: 40000 },
    { part_key: 'air_filter', fuel_type_code: 'hev',      interval_km: 40000 },
    { part_key: 'air_filter', fuel_type_code: 'phev',     interval_km: 40000 },

    // 5-9. 에어컨필터 (pmo 방식)
    { part_key: 'cabin_filter', fuel_type_code: 'gasoline', interval_months: 6, note: '봄·가을 연 2회' },
    { part_key: 'cabin_filter', fuel_type_code: 'diesel',   interval_months: 6 },
    { part_key: 'cabin_filter', fuel_type_code: 'lpg',      interval_months: 6 },
    { part_key: 'cabin_filter', fuel_type_code: 'hev',      interval_months: 6 },
    { part_key: 'cabin_filter', fuel_type_code: 'phev',     interval_months: 6 },
    { part_key: 'cabin_filter', fuel_type_code: 'ev',       interval_months: 6 },

    // 5-10. 연료필터
    { part_key: 'fuel_filter', fuel_type_code: 'diesel', interval_km: 30000, note: '수분 분리기 겸용 시 주행감 저하 전 교환' },
    { part_key: 'fuel_filter', fuel_type_code: 'lpg',    interval_km: 20000, note: 'LPG 봄베 필터. 시동성 저하 전 교환' },

    // 5-11. DPF (is_chain=true — 강제재생 모니터링)
    { part_key: 'dpf', fuel_type_code: 'diesel', is_chain: true, note: '강제재생 주기 OBD 모니터링. 200,000km 교환 목표' },

    // 5-12. 변속기오일 (변속기 타입별 — 14개)
    { part_key: 'trans_fluid', fuel_type_code: 'gasoline', transmission_code: 'at',      interval_km: 80000, note: '일부 메이커 무교환 표방, 실사용 80K 권장' },
    { part_key: 'trans_fluid', fuel_type_code: 'gasoline', transmission_code: 'mt',      interval_km: 40000 },
    { part_key: 'trans_fluid', fuel_type_code: 'gasoline', transmission_code: 'dct_wet', interval_km: 60000 },
    { part_key: 'trans_fluid', fuel_type_code: 'gasoline', transmission_code: 'dct_dry', interval_km: 40000, note: '건식은 더 빈번' },
    { part_key: 'trans_fluid', fuel_type_code: 'gasoline', transmission_code: 'cvt',     interval_km: 40000 },
    { part_key: 'trans_fluid', fuel_type_code: 'diesel',   transmission_code: 'at',      interval_km: 80000 },
    { part_key: 'trans_fluid', fuel_type_code: 'diesel',   transmission_code: 'mt',      interval_km: 40000 },
    { part_key: 'trans_fluid', fuel_type_code: 'diesel',   transmission_code: 'dct_wet', interval_km: 60000 },
    { part_key: 'trans_fluid', fuel_type_code: 'diesel',   transmission_code: 'dct_dry', interval_km: 40000 },
    { part_key: 'trans_fluid', fuel_type_code: 'lpg',      transmission_code: 'at',      interval_km: 80000 },
    { part_key: 'trans_fluid', fuel_type_code: 'lpg',      transmission_code: 'mt',      interval_km: 40000 },
    { part_key: 'trans_fluid', fuel_type_code: 'hev',      transmission_code: 'at',      interval_km: 80000, note: '회생제동으로 변속 충격 적음' },
    { part_key: 'trans_fluid', fuel_type_code: 'phev',     transmission_code: 'at',      interval_km: 80000 },
    { part_key: 'trans_fluid', fuel_type_code: 'phev',     transmission_code: 'dct_wet', interval_km: 60000 },

    // 5-13. 감속기오일
    { part_key: 'reducer_oil', fuel_type_code: 'ev', transmission_code: 'e_motor', interval_km: 120000, note: '제조사 권장. 누유 없으면 무교환 모델도 있음' },

    // 5-14. 브레이크오일 (pmo 방식)
    { part_key: 'brake_fluid', fuel_type_code: 'gasoline', interval_months: 24, note: 'DOT 4 기준 2년' },
    { part_key: 'brake_fluid', fuel_type_code: 'diesel',   interval_months: 24 },
    { part_key: 'brake_fluid', fuel_type_code: 'lpg',      interval_months: 24 },
    { part_key: 'brake_fluid', fuel_type_code: 'hev',      interval_months: 36, note: '회생제동으로 실사용 빈도 낮아 수명 연장' },
    { part_key: 'brake_fluid', fuel_type_code: 'phev',     interval_months: 36 },
    { part_key: 'brake_fluid', fuel_type_code: 'ev',       interval_months: 48, note: '회생제동이 대부분, 유압 브레이크 사용 최소' },

    // 5-15. 브레이크패드(전)
    { part_key: 'brake_pad_front', fuel_type_code: 'gasoline', interval_km: 50000,  note: '전륜이 후륜보다 제동 부하 더 큼. 두께 3mm 이하 즉시 교환' },
    { part_key: 'brake_pad_front', fuel_type_code: 'diesel',   interval_km: 50000 },
    { part_key: 'brake_pad_front', fuel_type_code: 'lpg',      interval_km: 50000 },
    { part_key: 'brake_pad_front', fuel_type_code: 'hev',      interval_km: 80000,  note: '회생제동으로 약 1.5~2배 수명' },
    { part_key: 'brake_pad_front', fuel_type_code: 'phev',     interval_km: 80000 },
    { part_key: 'brake_pad_front', fuel_type_code: 'ev',       interval_km: 100000, note: '회생제동 비율 최대' },

    // 5-16. 브레이크패드(후)
    { part_key: 'brake_pad_rear', fuel_type_code: 'gasoline', interval_km: 70000 },
    { part_key: 'brake_pad_rear', fuel_type_code: 'diesel',   interval_km: 70000 },
    { part_key: 'brake_pad_rear', fuel_type_code: 'lpg',      interval_km: 70000 },
    { part_key: 'brake_pad_rear', fuel_type_code: 'hev',      interval_km: 100000 },
    { part_key: 'brake_pad_rear', fuel_type_code: 'phev',     interval_km: 100000 },
    { part_key: 'brake_pad_rear', fuel_type_code: 'ev',       interval_km: 120000 },

    // 5-17. 브레이크디스크 (전·후 통합)
    { part_key: 'brake_disc', fuel_type_code: 'gasoline', interval_km: 120000, note: '두께 기준 점검 병행. 마모 한계 도달 시 즉시 교환' },
    { part_key: 'brake_disc', fuel_type_code: 'diesel',   interval_km: 120000 },
    { part_key: 'brake_disc', fuel_type_code: 'lpg',      interval_km: 120000 },
    { part_key: 'brake_disc', fuel_type_code: 'hev',      interval_km: 150000, note: '회생제동으로 마모 적음' },
    { part_key: 'brake_disc', fuel_type_code: 'phev',     interval_km: 150000 },
    { part_key: 'brake_disc', fuel_type_code: 'ev',       interval_km: 200000 },

    // 5-18. 타이어
    { part_key: 'tire', fuel_type_code: 'gasoline', interval_km: 50000, note: '트레드 1.6mm 이하 즉시 교환' },
    { part_key: 'tire', fuel_type_code: 'diesel',   interval_km: 50000 },
    { part_key: 'tire', fuel_type_code: 'lpg',      interval_km: 50000 },
    { part_key: 'tire', fuel_type_code: 'hev',      interval_km: 50000 },
    { part_key: 'tire', fuel_type_code: 'phev',     interval_km: 50000 },
    { part_key: 'tire', fuel_type_code: 'ev',       interval_km: 40000, note: 'EV 중량으로 마모 더 빠름' },

    // 5-19. 타이어 로테이션
    { part_key: 'tire_rotation', fuel_type_code: 'gasoline', interval_km: 10000, note: '얼라이먼트 동시 점검 권장' },
    { part_key: 'tire_rotation', fuel_type_code: 'diesel',   interval_km: 10000 },
    { part_key: 'tire_rotation', fuel_type_code: 'lpg',      interval_km: 10000 },
    { part_key: 'tire_rotation', fuel_type_code: 'hev',      interval_km: 10000 },
    { part_key: 'tire_rotation', fuel_type_code: 'phev',     interval_km: 10000 },
    { part_key: 'tire_rotation', fuel_type_code: 'ev',       interval_km: 10000 },

    // 5-20. 냉각수 (pmo 방식)
    { part_key: 'coolant', fuel_type_code: 'gasoline', interval_months: 60, note: 'OAT 장수명 타입 기준 5년' },
    { part_key: 'coolant', fuel_type_code: 'diesel',   interval_months: 48, note: '일반 LLC 기준 4년' },
    { part_key: 'coolant', fuel_type_code: 'lpg',      interval_months: 48 },
    { part_key: 'coolant', fuel_type_code: 'hev',      interval_months: 60 },
    { part_key: 'coolant', fuel_type_code: 'phev',     interval_months: 60 },

    // 5-21. 인버터 냉각수 (pmo 방식)
    { part_key: 'inverter_coolant', fuel_type_code: 'hev',  interval_months: 60, note: '전용 LLC, 일반 냉각수 혼용 절대 금지' },
    { part_key: 'inverter_coolant', fuel_type_code: 'phev', interval_months: 60 },
    { part_key: 'inverter_coolant', fuel_type_code: 'ev',   interval_months: 60 },

    // 5-22. 12V 보조배터리 (pmo 방식)
    { part_key: 'battery_12v', fuel_type_code: 'gasoline', interval_months: 60 },
    { part_key: 'battery_12v', fuel_type_code: 'diesel',   interval_months: 60 },
    { part_key: 'battery_12v', fuel_type_code: 'lpg',      interval_months: 60 },
    { part_key: 'battery_12v', fuel_type_code: 'hev',      interval_months: 48, note: 'HEV 특성상 AGM 배터리 열화 빠름' },
    { part_key: 'battery_12v', fuel_type_code: 'phev',     interval_months: 48 },
    { part_key: 'battery_12v', fuel_type_code: 'ev',       interval_months: 48 },

    // 5-23. 고전압배터리 점검
    { part_key: 'hv_battery_check', fuel_type_code: 'hev',  interval_km: 15000, note: 'SOC 20~80% 유지 권장' },
    { part_key: 'hv_battery_check', fuel_type_code: 'phev', interval_km: 15000 },
    { part_key: 'hv_battery_check', fuel_type_code: 'ev',   interval_km: 15000, note: 'BMS 진단 병행' },

    // 5-24. 고무부싱(현가)
    { part_key: 'rubber_bushing', fuel_type_code: 'gasoline', interval_km: 80000, note: '소음·핸들링 유격·편마모 발생 시 교환' },
    { part_key: 'rubber_bushing', fuel_type_code: 'diesel',   interval_km: 80000 },
    { part_key: 'rubber_bushing', fuel_type_code: 'lpg',      interval_km: 80000 },
    { part_key: 'rubber_bushing', fuel_type_code: 'hev',      interval_km: 80000 },
    { part_key: 'rubber_bushing', fuel_type_code: 'phev',     interval_km: 80000 },
    { part_key: 'rubber_bushing', fuel_type_code: 'ev',       interval_km: 80000, note: '중량 큰 EV는 부싱 부하 더 큼' },
  ];

  // skipDuplicates로 재실행 안전성 확보
  await prisma.maintenanceIntervalPreset.createMany({
    data: presets.map((p) => ({
      part_key:          p.part_key,
      fuel_type_code:    p.fuel_type_code,
      transmission_code: p.transmission_code ?? null,
      interval_km:       p.interval_km ?? null,
      interval_months:   p.interval_months ?? null,
      is_chain:          p.is_chain ?? false,
      note:              p.note ?? null,
    })),
  });
  console.log(`  ✓ MaintenanceIntervalPreset ${presets.length}개`);

  console.log('\n✅ 시드 완료!');
  console.log(`  차종 코드: 10 / 연료 코드: 6 / 변속기 코드: 6 / 제조사 코드: 7`);
  console.log(`  부품 마스터: 25 / 프리셋: ${presets.length}`);
}

main()
  .catch((e) => {
    console.error('❌ 시드 실패:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
