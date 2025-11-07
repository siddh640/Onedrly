import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Attractions } from './attractions';

describe('Attractions', () => {
  let component: Attractions;
  let fixture: ComponentFixture<Attractions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Attractions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Attractions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
