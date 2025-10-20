import type { Gender, Status } from "../enums/enum";


export interface PersonalInfo {
  name: string;
  nationalId: string;
  dob: string;
  gender?: (typeof Gender)[keyof typeof Gender] | '';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface FamilyFinancialInfo {
  maritalStatus?: string;
  dependents?: number;
  employmentStatus?: string;
  monthlyIncome?: number;
  housingStatus?: string;
}

export interface SituationDescriptions {
  financialSituation?: string;
  employmentCircumstances?: string;
  reasonForApplying?: string;
}

export interface UserSignUp {
  role?: string,
  name?: string,
  email?: string,
  password?: string,
}

export interface SSApplication {
  id?: number;
  personalInfo?: PersonalInfo;
  familyFinancialInfo?: FamilyFinancialInfo;
  situationDescriptions?: SituationDescriptions;
  status?: Status;
  createdAt?: string;
  updatedAt?: string;
  userEmail?: string;
  employmentStatus?: string;
  housingStatus?: string;
  submittedOn?: string;
}