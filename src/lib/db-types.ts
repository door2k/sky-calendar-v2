export interface DbPerson {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  avatar_url_2?: string;
}

export interface DbActivity {
  id: string;
  name: string;
  address?: string;
  maps_url?: string;
  contact_phone?: string;
  note?: string;
  name_he?: string;
  note_he?: string;
  address_he?: string;
  is_recurring: boolean;
  recurrence_day?: string;
  default_time?: string;
  created_by?: string;
  icon?: string;
  associated_person_ids?: string[];
}

export interface DbDaySchedule {
  id: string;
  date: string;
  dropoff_person_id?: string | null;
  gan_activity?: string | null;
  pickup_person_id?: string | null;
  after_gan_activity_id?: string | null;
  after_gan_time?: string | null;
  bedtime_person_id?: string | null;
  is_no_gan: boolean;
  no_gan_reason?: string | null;
  notes?: string | null;
  gan_activity_he?: string | null;
  no_gan_reason_he?: string | null;
  notes_he?: string | null;
  created_by?: string;
  updated_by?: string;
  family_dinner_person_id?: string | null;
  family_dinner_time?: string | null;
}

export interface DbSaturdayActivity {
  activity_id: string;
  time?: string;
  custom_name?: string;
  custom_name_he?: string;
}

export interface DbSaturdaySchedule {
  id: string;
  date: string;
  activities: DbSaturdayActivity[];
  notes?: string | null;
  notes_he?: string | null;
  activities_he?: DbSaturdayActivity[];
  created_by?: string;
  updated_by?: string;
  family_dinner_person_id?: string | null;
  family_dinner_time?: string | null;
}

export interface DbWeekData {
  startDate: string;
  days: (DbDaySchedule | null)[];
  saturday: DbSaturdaySchedule | null;
  lastFriday?: DbSaturdaySchedule | null;
  fridayIsLastOfMonth?: boolean;
}
