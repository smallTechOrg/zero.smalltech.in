import { LeadStatus } from "../dashboard/useLeads";

export interface LeadRowData {
  session_id: string;
  name: string;
  email: string;
  mobile_number: string;
  country: string;
  status: LeadStatus;
  remarks?: string;
  is_active: boolean;
  domain: string;
  time: string;
}

export interface Message {
  sender: string;
  text: string;
}

export interface HistoryItem {
  type: 'human' | 'ai';
  content: string;
}
