import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/core/service/auth.service';

type HeightUnit = 'cm' | 'in';
type WeightUnit = 'kg' | 'lb';
type SexForCalculations = 'female' | 'male' | 'intersex' | 'prefer-not-to-say' | '';
type FitnessGoal = 'strength' | 'endurance' | 'general-fitness' | 'flexibility' | 'weight-management';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

interface FitnessProfile {
  age: number;
  height: number;
  heightUnit: HeightUnit;
  weight: number;
  weightUnit: WeightUnit;
  sexForCalculations: SexForCalculations;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  workoutTypes: string[];
  equipment: string[];
  daysPerWeek: number;
  minutesPerWorkout: number;
}

const workoutOptions = [
  { value: 'strength', label: 'Strength training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'sports', label: 'Sports' },
  { value: 'walking', label: 'Walking' }
];

const equipmentOptions = [
  { value: 'bodyweight', label: 'Bodyweight only' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'resistance-bands', label: 'Resistance bands' },
  { value: 'home-gym', label: 'Home gym' },
  { value: 'full-gym', label: 'Full gym access' }
];

@Component({
  selector: 'app-fitness-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @Input() setupMode = false;
  @Output() setupComplete = new EventEmitter<void>();

  fitnessProfile: FitnessProfile | null = null;
  isEditing = false;
  saveMessage = '';
  storageErrorMessage = '';
  readonly workoutOptions = workoutOptions;
  readonly equipmentOptions = equipmentOptions;
  readonly profileForm = this.fb.nonNullable.group({
    age: [null as number | null, [Validators.required, Validators.min(13), Validators.max(120), Validators.pattern(/^\d+$/)]],
    height: [null as number | null, [Validators.required, Validators.min(20), Validators.max(250)]],
    heightUnit: ['cm' as HeightUnit, Validators.required],
    weight: [null as number | null, [Validators.required, Validators.min(20), Validators.max(770)]],
    weightUnit: ['kg' as WeightUnit, Validators.required],
    sexForCalculations: ['' as SexForCalculations],
    goal: ['general-fitness' as FitnessGoal, Validators.required],
    experienceLevel: ['beginner' as ExperienceLevel, Validators.required],
    workoutTypes: [[] as string[]],
    equipment: [[] as string[]],
    daysPerWeek: [3, [Validators.required, Validators.min(1), Validators.max(7)]],
    minutesPerWorkout: [45, [Validators.required, Validators.min(15), Validators.max(180)]]
  });

  ngOnInit(): void {
    this.loadProfile();
    this.isEditing = this.setupMode || !this.fitnessProfile;
  }

  get profileStorageKey(): string {
    const userId = this.authService.currentUser?.id;
    return userId === undefined
      ? 'fyntriva-fitness-profile'
      : `fyntriva-fitness-profile-${userId}`;
  }

  get setupDismissedStorageKey(): string {
    const userId = this.authService.currentUser?.id;
    return userId === undefined
      ? 'fyntriva-profile-setup-dismissed'
      : `fyntriva-profile-setup-dismissed-${userId}`;
  }

  save(): void {
    this.storageErrorMessage = '';
    this.saveMessage = '';
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    const profile: FitnessProfile = {
      age: Number(value.age),
      height: Number(value.height),
      heightUnit: value.heightUnit,
      weight: Number(value.weight),
      weightUnit: value.weightUnit,
      sexForCalculations: value.sexForCalculations,
      goal: value.goal,
      experienceLevel: value.experienceLevel,
      workoutTypes: value.workoutTypes,
      equipment: value.equipment,
      daysPerWeek: Number(value.daysPerWeek),
      minutesPerWorkout: Number(value.minutesPerWorkout)
    };
    const validHeight = profile.heightUnit === 'cm'
      ? profile.height >= 50 && profile.height <= 250
      : profile.height >= 20 && profile.height <= 100;
    const validWeight = profile.weightUnit === 'kg'
      ? profile.weight >= 20 && profile.weight <= 350
      : profile.weight >= 44 && profile.weight <= 770;

    if (!validHeight || !validWeight) {
      if (!validHeight) {
        this.profileForm.controls.height.setErrors({ range: true });
        this.profileForm.controls.height.markAsTouched();
      }
      if (!validWeight) {
        this.profileForm.controls.weight.setErrors({ range: true });
        this.profileForm.controls.weight.markAsTouched();
      }
      return;
    }

    try {
      localStorage.setItem(this.profileStorageKey, JSON.stringify(profile));
      localStorage.setItem(this.setupDismissedStorageKey, 'true');
      this.fitnessProfile = profile;
      this.isEditing = false;
      this.saveMessage = 'Fitness profile saved on this device.';
      if (this.setupMode) {
        this.setupComplete.emit();
      }
    } catch {
      this.storageErrorMessage =
        'Unable to save your profile in this browser. Check your device storage settings and try again.';
    }
  }

  isSelected(controlName: 'workoutTypes' | 'equipment', value: string): boolean {
    return this.profileForm.controls[controlName].value.includes(value);
  }

  toggleSelection(controlName: 'workoutTypes' | 'equipment', value: string): void {
    const control = this.profileForm.controls[controlName];
    const selected = control.value;
    control.setValue(
      selected.includes(value)
        ? selected.filter(item => item !== value)
        : [...selected, value]
    );
  }

  getGoalLabel(goal: FitnessGoal): string {
    return {
      strength: 'Build strength',
      endurance: 'Improve endurance',
      'general-fitness': 'General fitness',
      flexibility: 'Improve flexibility',
      'weight-management': 'Weight management'
    }[goal];
  }

  getOptionLabels(values: string[], options: { value: string; label: string }[]): string {
    return values
      .map(value => options.find(option => option.value === value)?.label)
      .filter((label): label is string => label !== undefined)
      .join(', ') || 'Not set';
  }

  edit(): void {
    this.profileForm.patchValue(this.fitnessProfile!);
    this.saveMessage = '';
    this.storageErrorMessage = '';
    this.isEditing = true;
  }

  cancelEdit(): void {
    if (this.fitnessProfile) {
      this.profileForm.patchValue(this.fitnessProfile);
      this.isEditing = false;
    }
  }

  skipSetup(): void {
    try {
      localStorage.setItem(this.setupDismissedStorageKey, 'true');
      this.setupComplete.emit();
    } catch {
      this.storageErrorMessage =
        'Unable to save this preference in your browser. This setup will not be remembered next time.';
      this.setupComplete.emit();
    }
  }

  private loadProfile(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const stored = localStorage.getItem(this.profileStorageKey);
      if (!stored) {
        return;
      }

      const parsed: unknown = JSON.parse(stored);
      const normalized = this.normalizeFitnessProfile(parsed);
      if (!normalized) {
        this.storageErrorMessage =
          'Your saved fitness profile is invalid. You can enter it again below.';
        return;
      }
      this.fitnessProfile = normalized;
      this.profileForm.patchValue(normalized);
    } catch {
      this.storageErrorMessage =
        'Your saved fitness profile could not be read. You can enter it again below.';
    }
  }

  private normalizeFitnessProfile(value: unknown): FitnessProfile | null {
    if (!value || typeof value !== 'object') {
      return null;
    }
    const profile = value as Partial<FitnessProfile> & { gender?: SexForCalculations };
    const normalized: FitnessProfile = {
      age: profile.age as number,
      height: profile.height as number,
      heightUnit: profile.heightUnit as HeightUnit,
      weight: profile.weight as number,
      weightUnit: profile.weightUnit as WeightUnit,
      sexForCalculations: profile.sexForCalculations ?? profile.gender ?? '',
      goal: profile.goal ?? 'general-fitness',
      experienceLevel: profile.experienceLevel ?? 'beginner',
      workoutTypes: profile.workoutTypes ?? [],
      equipment: profile.equipment ?? [],
      daysPerWeek: profile.daysPerWeek ?? 3,
      minutesPerWorkout: profile.minutesPerWorkout ?? 45
    };
    const valid = typeof normalized.age === 'number' &&
      Number.isInteger(normalized.age) &&
      normalized.age >= 13 &&
      normalized.age <= 120 &&
      typeof normalized.height === 'number' &&
      Number.isFinite(normalized.height) &&
      (normalized.heightUnit === 'cm' || normalized.heightUnit === 'in') &&
      (normalized.heightUnit === 'cm'
        ? normalized.height >= 50 && normalized.height <= 250
        : normalized.height >= 20 && normalized.height <= 100) &&
      typeof normalized.weight === 'number' &&
      Number.isFinite(normalized.weight) &&
      (normalized.weightUnit === 'kg' || normalized.weightUnit === 'lb') &&
      (normalized.weightUnit === 'kg'
        ? normalized.weight >= 20 && normalized.weight <= 350
        : normalized.weight >= 44 && normalized.weight <= 770) &&
      ['', 'female', 'male', 'intersex', 'prefer-not-to-say'].includes(normalized.sexForCalculations) &&
      ['strength', 'endurance', 'general-fitness', 'flexibility', 'weight-management'].includes(normalized.goal) &&
      ['beginner', 'intermediate', 'advanced'].includes(normalized.experienceLevel) &&
      Array.isArray(normalized.workoutTypes) &&
      normalized.workoutTypes.every(type => workoutOptions.some(option => option.value === type)) &&
      Array.isArray(normalized.equipment) &&
      normalized.equipment.every(item => equipmentOptions.some(option => option.value === item)) &&
      Number.isInteger(normalized.daysPerWeek) &&
      normalized.daysPerWeek >= 1 &&
      normalized.daysPerWeek <= 7 &&
      Number.isInteger(normalized.minutesPerWorkout) &&
      normalized.minutesPerWorkout >= 15 &&
      normalized.minutesPerWorkout <= 180;
    return valid ? normalized : null;
  }
}
