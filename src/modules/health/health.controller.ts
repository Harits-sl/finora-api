import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { successResponse } from '../../common/utils/response.util';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return successResponse(null, 'Server is running');
  }
}
