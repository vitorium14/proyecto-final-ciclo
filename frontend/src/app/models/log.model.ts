import { User } from './user.model';

export interface Log {
  id: number;
  createdAt: string;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  user: User;
}

export interface LogList {
  logs: Log[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LogStats {
  totalLogs: number;
  byAction: { action: string; count: number }[];
  byEntityType: { entityType: string; count: number }[];
  byUser: { id: number; name: string; email: string; count: number }[];
  byDate: { date: string; count: number }[];
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out'
}

export enum LogEntityType {
  USER = 'user',
  ROOM = 'room',
  ROOM_TYPE = 'room_type',
  SERVICE = 'service',
  RESERVATION = 'reservation'
}

export interface LogResponse {
  logs: Log[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface LogFilterOptions {
  userId?: number;
  action?: LogAction;
  entityType?: LogEntityType;
  entityId?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
} 