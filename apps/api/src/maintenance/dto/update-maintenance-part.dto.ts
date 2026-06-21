import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenancePartDto } from './create-maintenance-part.dto';

export class UpdateMaintenancePartDto extends PartialType(CreateMaintenancePartDto) {}
