export type UserType = 'brand' | 'agency' | 'creator' | 'event_organizer' | 'admin';

export interface AuthenticatedUser {
  id: string;
  email: string;
  userType: UserType;
  profile: {
    companyName: string | null;
    profilePictureUrl: string | null;
    location: string | null;
  };
}
