import { TestBed } from '@angular/core/testing';

import { Transport } from './transport';

describe('Transport', () => {
  let service: Transport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Transport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
