
import type { PersonalInfo, FamilyFinancialInfo, SituationDescriptions, UserSignUp } from '../interfaces/data';

export const defaultPersonalInfo: PersonalInfo = {
  name: '',
  nationalId: '',
  dob: '',
  gender: '',
  address: ''
};

export const defaultFamilyFinancialInfo: FamilyFinancialInfo = {
  maritalStatus: '',
  dependents: 0,
  employmentStatus: '',
  monthlyIncome: 0,
  housingStatus: ''
};

export const defaultSituationDescriptions: SituationDescriptions = {
  financialSituation: '',
  employmentCircumstances: '',
  reasonForApplying: ''
};

export const defaultUserSignUp: UserSignUp = {
    role: 'user',
    name: '',
    email: '',
    password: '',
};