import { Test, TestingModule } from '@nestjs/testing';
import { ReloadlyDataService } from './reloadly-data.service';

describe('ReloadlyDataService', () => {
  let service: ReloadlyDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReloadlyDataService],
    }).compile();

    service = module.get<ReloadlyDataService>(ReloadlyDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
