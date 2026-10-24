import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../shared/core/service/auth.service';
import { ThemeService } from '../../shared/core/service/theme.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const authServiceMock = {
    currentUser: {
      id: 12,
      firstName: 'Taylor',
      lastName: 'Morgan',
      email: 'taylor@example.com',
      role: 'USER',
      active: true,
      createdAt: '2026-10-24T19:51:27',
      updatedAt: '2026-10-24T19:51:27'
    }
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ThemeService,
          useValue: {
            isDarkTheme: () => false,
            setDarkTheme: () => undefined
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the tour automatically for a new user', () => {
    expect(component.isOnboardingVisible).toBeTrue();
    expect(component.onboardingStep.title).toBe('Your dashboard');
  });

  it('shows optional profile setup after skipping the tour', () => {
    component.skipOnboarding();

    expect(component.isOnboardingVisible).toBeFalse();
    expect(component.isFitnessProfileSetupVisible).toBeTrue();
    expect(localStorage.getItem('fyntriva-onboarding-complete-12')).toBe('true');

    component.completeFitnessProfileSetup();

    expect(component.isFitnessProfileSetupVisible).toBeFalse();
  });

  it('advances through the tour and opens profile setup after the final action', () => {
    component.nextOnboardingStep();
    expect(component.onboardingStep.title).toBe('Your workouts');

    component.nextOnboardingStep();
    expect(component.onboardingStep.title).toBe('Your goals');

    component.nextOnboardingStep();
    expect(component.isOnboardingVisible).toBeFalse();
    expect(component.isFitnessProfileSetupVisible).toBeTrue();
    expect(localStorage.getItem('fyntriva-onboarding-complete-12')).toBe('true');
  });

  it('does not automatically show completed steps and can replay the tour', () => {
    localStorage.setItem('fyntriva-onboarding-complete-12', 'true');
    localStorage.setItem('fyntriva-profile-setup-dismissed-12', 'true');
    fixture.destroy();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isOnboardingVisible).toBeFalse();

    component.startOnboarding();

    expect(component.isOnboardingVisible).toBeTrue();
    expect(component.onboardingStepIndex).toBe(0);
  });
});
