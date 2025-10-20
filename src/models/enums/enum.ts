export const Gender = {
  Male: 'male',
  Female: 'female',
  Other: 'other'
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];


export const MaritalStatus = {
  Single: 'single',
  Married: 'married',
  Divorced: 'divorced',
  Widowed: 'widowed'
} as const;

export type MaritalStatus = (typeof MaritalStatus)[keyof typeof MaritalStatus];

export const Status = {
  Draft: 'draft',
  Submitted: 'submitted',
  Approved: 'approved',
  Rejected: 'rejected'
} as const;

export type Status = (typeof Status)[keyof typeof Status];
