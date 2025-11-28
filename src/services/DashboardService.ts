import { baseHttpClient } from "./abstract/BaseHttpClient";

export interface DashboardKPIs {
  totalClients: number;
  totalLawsuits: number;
  totalRevenue: number;
  unpaidRevenue: number;
  totalStorageBytes: number;
}

export interface UpcomingEvent {
  _id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  lawsuit: {
    _id: string;
    lawsuitCode: string;
  } | null;
  clients: Array<{
    _id: string;
    fullName: string;
  }>;
}

export interface ClientProgressData {
  date: string;
  count: number;
  cumulativeCount: number;
}

export interface PaymentProgressData {
  date: string;
  amount: number;
  cumulativeAmount: number;
  paymentsCount: number;
}

export interface LawsuitProgressData {
  date: string;
  count: number;
  cumulativeCount: number;
  status: string;
  statusCounts: {
    DONE: number;
    INPROGRESS: number;
    SCHEDULED: number;
    CANCELLED: number;
  };
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  upcomingEvents: UpcomingEvent[];
  clientProgress: ClientProgressData[];
  paymentProgress: PaymentProgressData[];
  lawsuitProgress: LawsuitProgressData[];
}

class DashboardService {
  private instance = baseHttpClient.instance;

  getStats = () =>
    this.instance.get<DashboardStats>("/api/dashboard/stats");
}

const dashboardService = new DashboardService();
export { dashboardService };
