import { User } from './user.model';

export interface Log {
  id: number;
  user: User;
  action: LogAction;
  entityType: LogEntityType;
  entityId: number;
  details: string;
  createdAt: Date;
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