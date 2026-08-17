import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a toggle button', () => {
    const button = fixture.nativeElement.querySelector('button.theme-btn');
    expect(button).toBeTruthy();
  });

  it('should default isDark based on prefers-color-scheme when no saved theme', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    expect(component.isDark).toBe(prefersDark);
  });

  it('should toggle isDark when toggle is called', () => {
    const initial = component.isDark;
    component.toggle();
    expect(component.isDark).toBe(!initial);
  });

  it('should save theme to localStorage on toggle', () => {
    component.toggle();
    expect(localStorage.getItem('theme')).toBe(component.isDark ? 'dark' : 'light');
  });

  it('should toggle back and forth', () => {
    component.toggle();
    const afterFirst = component.isDark;
    component.toggle();
    expect(component.isDark).toBe(!afterFirst);
  });

  it('should load light theme from localStorage', () => {
    localStorage.setItem('theme', 'light');
    const newFixture = TestBed.createComponent(ThemeToggleComponent);
    newFixture.detectChanges();
    expect(newFixture.componentInstance.isDark).toBeFalse();
  });

  it('should load dark theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const newFixture = TestBed.createComponent(ThemeToggleComponent);
    newFixture.detectChanges();
    expect(newFixture.componentInstance.isDark).toBeTrue();
  });
});
