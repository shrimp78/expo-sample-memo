/**
 *  ユーザーの型
 */
type User = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  onboardingVersion?: number;
};

export type { User };
