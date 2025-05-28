export interface Sample {
  name: string;
  age: number;
  isActive: boolean;
  email: string;
  address: Interface1;
  hobbies: string[];
  scores: number[];
  metadata: Interface3;
  tags: unknown[];
  preferences: Interface4;
}

export interface Interface2 {
  lat: number;
  lng: number;
}

export interface Interface1 {
  street: string;
  zipCode: string;
  coordinates: Interface2;
}

export interface Interface3 {
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Interface5 {
  email: boolean;
  push: boolean;
  sms: null;
}

export interface Interface4 {
  theme: string;
  language: string;
  notifications: Interface5;
}