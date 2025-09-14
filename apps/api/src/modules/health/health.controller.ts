import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('/healthz')
  health() {
    return { status: 'ok' };
  }

  @Get('/readyz')
  ready() {
    // Eventually check DB/Redis connectivity
    return { status: 'ready' };
  }
}
