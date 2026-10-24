import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../../shared/core/service/auth.service';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let component: ProfileComponent;
  const authServiceMock = { currentUser: { id: 12 } };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('saves a validated fitness profile for the current user', () => {
    fixture.detectChanges();
    expect(component.profileForm.controls.age.value).toBeNull();
    expect(component.profileForm.controls.height.value).toBeNull();
    expect(component.profileForm.controls.weight.value).toBeNull();
    component.profileForm.setValue({
      age: 28,
      height: 170,
      heightUnit: 'cm',
      weight: 70,
      weightUnit: 'kg',
      sexForCalculations: 'female',
      goal: 'strength',
      experienceLevel: 'intermediate',
      workoutTypes: ['strength', 'yoga'],
      equipment: ['dumbbells'],
      daysPerWeek: 4,
      minutesPerWorkout: 60
    });

    component.save();

    expect(JSON.parse(localStorage.getItem('fyntriva-fitness-profile-12')!)).toEqual({
      age: 28,
      height: 170,
      heightUnit: 'cm',
      weight: 70,
      weightUnit: 'kg',
      sexForCalculations: 'female',
      goal: 'strength',
      experienceLevel: 'intermediate',
      workoutTypes: ['strength', 'yoga'],
      equipment: ['dumbbells'],
      daysPerWeek: 4,
      minutesPerWorkout: 60
    });
    expect(localStorage.getItem('fyntriva-profile-setup-dismissed-12')).toBe('true');
    expect(component.isEditing).toBeFalse();
  });

  it('rejects measurements outside the selected unit ranges', () => {
    fixture.detectChanges();
    component.profileForm.setValue({
      age: 28,
      height: 40,
      heightUnit: 'cm',
      weight: 400,
      weightUnit: 'kg',
      sexForCalculations: '',
      goal: 'general-fitness',
      experienceLevel: 'beginner',
      workoutTypes: [],
      equipment: [],
      daysPerWeek: 3,
      minutesPerWorkout: 45
    });

    component.save();

    expect(component.fitnessProfile).toBeNull();
    expect(component.profileForm.controls.height.hasError('range')).toBeTrue();
    expect(component.profileForm.controls.weight.hasError('range')).toBeTrue();
  });

  it('toggles workout and equipment preferences', () => {
    fixture.detectChanges();

    component.toggleSelection('workoutTypes', 'strength');
    component.toggleSelection('equipment', 'dumbbells');

    expect(component.isSelected('workoutTypes', 'strength')).toBeTrue();
    expect(component.isSelected('equipment', 'dumbbells')).toBeTrue();

    component.toggleSelection('workoutTypes', 'strength');

    expect(component.isSelected('workoutTypes', 'strength')).toBeFalse();
  });

  it('loads and allows editing an existing profile', () => {
    const legacyProfile = {
      age: 31,
      height: 66,
      heightUnit: 'in',
      weight: 154,
      weightUnit: 'lb',
      gender: 'female',
    } as const;
    const expectedProfile = {
      age: 31,
      height: 66,
      heightUnit: 'in',
      weight: 154,
      weightUnit: 'lb',
      sexForCalculations: 'female',
      goal: 'general-fitness',
      experienceLevel: 'beginner',
      workoutTypes: [],
      equipment: [],
      daysPerWeek: 3,
      minutesPerWorkout: 45
    };
    localStorage.setItem('fyntriva-fitness-profile-12', JSON.stringify(legacyProfile));

    fixture.detectChanges();

    expect(JSON.stringify(component.fitnessProfile)).toBe(JSON.stringify(expectedProfile));
    expect(component.isEditing).toBeFalse();

    component.edit();

    expect(component.isEditing).toBeTrue();
    expect(JSON.stringify(component.profileForm.getRawValue())).toBe(JSON.stringify(expectedProfile));
  });

  it('emits completion and stores the profile setup skip', () => {
    fixture.componentRef.setInput('setupMode', true);
    fixture.detectChanges();
    const completeSpy = jasmine.createSpy('setupComplete');
    component.setupComplete.subscribe(completeSpy);

    component.skipSetup();

    expect(localStorage.getItem('fyntriva-profile-setup-dismissed-12')).toBe('true');
    expect(completeSpy).toHaveBeenCalled();
  });
});
