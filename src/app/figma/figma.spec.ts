import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Figma } from './figma';

describe('Figma', () => {
  let component: Figma;
  let fixture: ComponentFixture<Figma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Figma]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Figma);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
