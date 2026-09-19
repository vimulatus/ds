import type { Hue } from '@/lib/hue';

export const STAGES = [
  'enquiry',
  'qualification',
  'prospect',
  'site_visit',
  'negotiation',
  'booking',
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  enquiry: 'Enquiry',
  qualification: 'Qualification',
  prospect: 'Prospect',
  site_visit: 'Site visit',
  negotiation: 'Negotiation',
  booking: 'Booking',
};

export const SOURCES = ['Facebook', 'Website', 'Walk-in', 'Broker', '99acres', 'MagicBricks'] as const;
export type Source = (typeof SOURCES)[number];

/** Each source owns a hue, so a list of leads reads by color alone. */
export const SOURCE_HUE: Record<Source, Hue> = {
  Facebook: 'blue',
  Website: 'teal',
  'Walk-in': 'green',
  Broker: 'amber',
  '99acres': 'orange',
  MagicBricks: 'violet',
};

export type Person = { name: string; role: string };

/** A project the company sells. The lead page lists the ones without an open enquiry. */
export type Project = {
  id: string;
  name: string;
  locality: string;
  type: string;
  from: string;
  rera: string;
  description: string;
  amenities: string[];
  /** The unit types on sale. An enquiry marks the ones the lead wants. */
  units: string[];
  /** Why this project suits the lead, when it does. */
  fit?: string;
};

export type Enquiry = {
  id: string;
  project: string;
  locality: string;
  assigned: Person;
  source: Source;
  opened: string;
  stage: Stage;
  closed?: { on: string; reason: string };
  /** The project's unit types the lead wants. */
  wants: string[];
};

export type FollowUp = {
  id: string;
  when: string;
  remarks: string;
  state: 'due' | 'missed' | 'done';
};

export type Moment = {
  id: string;
  title: string;
  description?: string;
  actor: string;
  role?: string;
  when: string;
};

export type Note = { id: string; author: string; when: string; content: string };

export type Lead = {
  name: string;
  phone: { masked: string; full: string };
  email: string;
  assigned: Person;
  source: Source;
  budget: string;
  location: string;
  created: string;
  fields: [string, string][];
  followUps: FollowUp[];
  enquiries: Enquiry[];
  moments: Moment[];
  notes: Note[];
};

export const PEOPLE: [Person, Person, Person] = [
  { name: 'Ananya Iyer', role: 'Telecaller' },
  { name: 'Rahul Mehta', role: 'Sales executive' },
  { name: 'Sneha Patil', role: 'Sales manager' },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Skyline Heights',
    locality: 'Andheri West',
    type: 'Residential, 2 towers',
    from: '₹92 L',
    rera: 'P51800031245',
    units: ['2 BHK', '3 BHK', '3 BHK duplex'],
    description:
      'Two 28-storey towers off Link Road, 2 and 3 BHK, possession Dec 2027. Corner units face the Versova creek; the rest look over the podium garden. Two basement levels of parking, one slot per 2 BHK and two per 3 BHK.',
    amenities: ['Pool', 'Gym', 'Clubhouse', 'Kids play area'],
  },
  {
    id: 'p2',
    name: 'Palm Grove',
    locality: 'Goregaon East',
    type: 'Residential, 4 towers',
    from: '₹1.2 Cr',
    rera: 'P51800029871',
    units: ['2 BHK', '3 BHK', '4 BHK'],
    description: 'Gated township beside Aarey, 2 to 4 BHK, possession 2028.',
    amenities: ['Pool', 'Gym', 'Jogging track', 'Banquet hall'],
  },
  {
    id: 'p3',
    name: 'Lakeview Residency',
    locality: 'Powai',
    type: 'Residential, 1 tower',
    from: '₹98 L',
    rera: 'P51800033102',
    units: ['2 BHK', '3 BHK'],
    description: 'One 22-storey tower facing Powai lake, 2 and 3 BHK, ready to move.',
    amenities: ['Pool', 'Gym', 'Rooftop garden'],
    fit: 'Within budget · ready to move',
  },
  {
    id: 'p4',
    name: 'Orchid Enclave',
    locality: 'Thane West',
    type: 'Residential, 3 towers',
    from: '₹68 L',
    rera: 'P51700027764',
    units: ['1 BHK', '2 BHK', '3 BHK'],
    description: 'Three towers on Ghodbunder Road, 1 to 3 BHK, possession 2027.',
    amenities: ['Pool', 'Gym', 'Clubhouse', 'Cricket pitch'],
    fit: 'Within budget',
  },
  {
    id: 'p5',
    name: 'Sunrise Towers',
    locality: 'Malad West',
    type: 'Residential, 2 towers',
    from: '₹1.4 Cr',
    rera: 'P51800030518',
    units: ['3 BHK', '4 BHK', '4 BHK duplex'],
    description:
      'Sea-facing 3 and 4 BHK on Marve Road, possession 2029. Every unit has a west deck; the top four floors are duplexes with private plunge pools. Payment plan is 20:80, with the balance on possession.',
    amenities: ['Infinity pool', 'Gym', 'Spa', 'Private theatre'],
  },
];

export const LEAD: Lead = {
  name: 'Priya Nair',
  phone: { masked: '+91 98••• ••412', full: '+91 98210 44412' },
  email: 'priya.nair@outlook.com',
  assigned: PEOPLE[0],
  source: 'Facebook',
  budget: '₹85 L – ₹1.1 Cr',
  location: 'Andheri West',
  created: 'Aug 20, 2026',
  fields: [
    ['Possession', 'Within 12 months'],
    ['Loan', 'Pre-approved, HDFC'],
  ],
  followUps: [
    { id: 'f3', when: 'Today, 4:30 pm', remarks: 'Confirm Saturday site visit', state: 'due' },
    { id: 'f2', when: 'Sep 12, 11:00 am', remarks: 'Share 3 BHK floor plan', state: 'done' },
    { id: 'f1', when: 'Aug 28, 5:00 pm', remarks: 'First call after Facebook form', state: 'done' },
  ],
  enquiries: [
    {
      id: 'e1',
      project: 'Skyline Heights',
      locality: 'Andheri West',
      assigned: PEOPLE[0],
      source: 'Facebook',
      opened: 'Aug 20',
      stage: 'qualification',
      wants: ['2 BHK', '3 BHK'],
    },
    {
      id: 'e2',
      project: 'Palm Grove',
      locality: 'Goregaon East',
      assigned: PEOPLE[1],
      source: 'Website',
      opened: 'Jul 3',
      stage: 'prospect',
      closed: { on: 'Aug 12', reason: 'Budget too high' },
      wants: ['2 BHK'],
    },
  ],
  moments: [
    {
      id: 'm6',
      title: 'Follow-up scheduled',
      description: 'Today, 4:30 pm · Confirm Saturday site visit',
      actor: 'Ananya Iyer',
      role: 'Telecaller',
      when: '2 h ago',
    },
    {
      id: 'm5',
      title: 'Stage moved',
      description: 'Skyline Heights: Enquiry → Qualification',
      actor: 'Ananya Iyer',
      role: 'Telecaller',
      when: 'Yesterday',
    },
    {
      id: 'm4',
      title: 'Call',
      description: 'Outgoing, 6 min. Wants a corner unit above the 10th floor.',
      actor: 'Ananya Iyer',
      role: 'Telecaller',
      when: 'Sep 14',
    },
    {
      id: 'm3',
      title: 'Not interested',
      description: 'Palm Grove: budget too high',
      actor: 'Rahul Mehta',
      role: 'Sales executive',
      when: 'Aug 12',
    },
    {
      id: 'm2',
      title: 'Enquiry received',
      description: 'Skyline Heights, via Facebook lead form',
      actor: 'System',
      when: 'Aug 20',
    },
    {
      id: 'm1',
      title: 'Enquiry received',
      description: 'Palm Grove, via website',
      actor: 'System',
      when: 'Jul 3',
    },
  ],
  notes: [
    {
      id: 'n2',
      author: 'Ananya Iyer',
      when: 'Sep 14',
      content: 'Prefers a corner unit above the 10th floor. Husband joins the site visit.',
    },
    {
      id: 'n1',
      author: 'Rahul Mehta',
      when: 'Jul 5',
      content: 'Palm Grove pricing was over budget by ₹20 L. Suggested Skyline.',
    },
  ],
};

/** A walk-in the team has not attached to a project yet. */
export const NEW_LEAD: Lead = {
  ...LEAD,
  name: 'Arjun Shetty',
  phone: { masked: '+91 99••• ••108', full: '+91 99870 22108' },
  email: 'arjun.shetty@gmail.com',
  source: 'Walk-in',
  budget: '₹60 L – ₹75 L',
  location: 'Thane West',
  created: 'Today',
  fields: [],
  followUps: [],
  enquiries: [],
  notes: [],
  moments: [
    {
      id: 'm1',
      title: 'Enquiry received',
      description: 'Walk-in at the Thane site office',
      actor: 'Sneha Patil',
      role: 'Sales manager',
      when: '20 min ago',
    },
  ],
};

/** A new event for the timeline, stamped as the current user, just now. */
export function moment(title: string, description?: string): Moment {
  return { id: `m-${crypto.randomUUID()}`, title, description, actor: 'You', when: 'Just now' };
}

/** The fields a person edits in place. Everything else on the lead is read-only here. */
export type Draft = Pick<Lead, 'budget' | 'location' | 'fields'>;

export function toDraft(lead: Lead): Draft {
  return {
    budget: lead.budget,
    location: lead.location,
    fields: lead.fields.map(([label, value]) => [label, value]),
  };
}

/** Rows the person emptied out do not count and do not save. */
export function tidyFields(fields: [string, string][]): [string, string][] {
  return fields
    .map(([label, value]) => [label.trim(), value.trim()] as [string, string])
    .filter(([label, value]) => label || value);
}

/** The names of the properties that differ from the saved lead. Their count drives the Changes bar. */
export function changedFields(lead: Lead, draft: Draft): string[] {
  const changed: string[] = [];
  if (draft.budget.trim() !== lead.budget) changed.push('Budget');
  if (draft.location.trim() !== lead.location) changed.push('Location');
  const after = tidyFields(draft.fields);
  const rows = Math.max(lead.fields.length, after.length);
  for (let i = 0; i < rows; i += 1) {
    const [beforeLabel, beforeValue] = lead.fields[i] ?? ['', ''];
    const [afterLabel, afterValue] = after[i] ?? ['', ''];
    if (beforeLabel !== afterLabel || beforeValue !== afterValue) {
      changed.push(afterLabel || beforeLabel || 'Field');
    }
  }
  return changed;
}
