-- CreateTable
CREATE TABLE "VehicleTypeCode" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "label_ko" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "FuelTypeCode" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "label_ko" TEXT NOT NULL,
    "has_engine" BOOLEAN NOT NULL,
    "has_spark_plug" BOOLEAN NOT NULL,
    "has_glow_plug" BOOLEAN NOT NULL,
    "has_dpf" BOOLEAN NOT NULL,
    "has_hv_battery" BOOLEAN NOT NULL,
    "sort_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "TransmissionTypeCode" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "label_ko" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ManufacturerCode" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "label_ko" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "MaintenancePartMaster" (
    "part_key" TEXT NOT NULL PRIMARY KEY,
    "name_ko" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "applicable_fuel_codes" TEXT NOT NULL,
    "role_description" TEXT,
    "tip_template" TEXT,
    "svg_key" TEXT,
    "sort_order" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "MaintenanceIntervalPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "part_key" TEXT NOT NULL,
    "fuel_type_code" TEXT NOT NULL,
    "transmission_code" TEXT,
    "interval_km" INTEGER,
    "interval_months" INTEGER,
    "is_chain" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    CONSTRAINT "MaintenanceIntervalPreset_part_key_fkey" FOREIGN KEY ("part_key") REFERENCES "MaintenancePartMaster" ("part_key") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceIntervalPreset_fuel_type_code_fkey" FOREIGN KEY ("fuel_type_code") REFERENCES "FuelTypeCode" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceIntervalPreset_transmission_code_fkey" FOREIGN KEY ("transmission_code") REFERENCES "TransmissionTypeCode" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model_name" TEXT,
    "license_plate" TEXT,
    "manufacturer_code" TEXT,
    "model_year" INTEGER,
    "vehicle_type_code" TEXT NOT NULL,
    "fuel_type_code" TEXT NOT NULL,
    "transmission_code" TEXT NOT NULL,
    "current_km" INTEGER NOT NULL,
    "annual_km" INTEGER NOT NULL,
    "monthly_km" INTEGER NOT NULL,
    "reference_date" DATETIME NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Vehicle_vehicle_type_code_fkey" FOREIGN KEY ("vehicle_type_code") REFERENCES "VehicleTypeCode" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_fuel_type_code_fkey" FOREIGN KEY ("fuel_type_code") REFERENCES "FuelTypeCode" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_transmission_code_fkey" FOREIGN KEY ("transmission_code") REFERENCES "TransmissionTypeCode" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_manufacturer_code_fkey" FOREIGN KEY ("manufacturer_code") REFERENCES "ManufacturerCode" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenancePart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicle_id" TEXT NOT NULL,
    "part_key" TEXT,
    "name" TEXT NOT NULL,
    "sub_name" TEXT,
    "category" TEXT NOT NULL,
    "interval_km" INTEGER,
    "interval_months" INTEGER,
    "is_chain" BOOLEAN NOT NULL DEFAULT false,
    "is_vehicle_specific" BOOLEAN NOT NULL DEFAULT false,
    "tip" TEXT,
    "svg_key" TEXT,
    "sort_order" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "MaintenancePart_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenancePart_part_key_fkey" FOREIGN KEY ("part_key") REFERENCES "MaintenancePartMaster" ("part_key") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "part_id" TEXT NOT NULL,
    "record_km" INTEGER,
    "record_date" DATETIME,
    "is_estimated_km" BOOLEAN NOT NULL DEFAULT false,
    "is_estimated_date" BOOLEAN NOT NULL DEFAULT false,
    "memo" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MaintenanceRecord_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "MaintenancePart" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceIntervalPreset_part_key_fuel_type_code_transmission_code_key" ON "MaintenanceIntervalPreset"("part_key", "fuel_type_code", "transmission_code");
