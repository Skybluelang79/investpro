export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  bonus: number;
}

export interface Kyc {
  id: number;
  user_id: number;
  document_type: string;
  document_number?: string | null;
  document_front?: string | null;
  document_back?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  verified_at?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  referral_code?: string | null;
  wallet?: Wallet;
  kyc?: Kyc | null;
  referrals_count?: number;
  referral_bonus_total?: number;
  created_at?: string;
}

export interface InvestmentPlan {
  id: number;
  name: string;
  description?: string | null;
  min_amount: number;
  max_amount: number | null;
  interest_rate: number;
  duration_days: number;
  badge?: string | null;
  is_active: boolean;
  investments_count?: number;
}

export type InvestmentStatus = 'active' | 'completed' | 'rejected';

export interface Investment {
  id: number;
  user_id: number;
  plan_id: number;
  plan?: InvestmentPlan;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  reference: string;
  amount: number;
  current_value: number;
  total_profit: number;
  daily_profit: number;
  status: InvestmentStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  next_payout_at?: string | null;
}

export interface Deposit {
  id: number;
  user_id: number;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  reference: string;
  amount: number;
  method: string;
  account_details?: Record<string, unknown> | null;
  status: 'pending' | 'completed' | 'failed';
  admin_note?: string | null;
  completed_at?: string | null;
  created_at?: string;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  reference: string;
  amount: number;
  method: string;
  account_details: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string | null;
  processed_at?: string | null;
  created_at?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'profit' | 'return' | 'bonus';

export interface Transaction {
  id: number;
  user_id: number;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference?: string | null;
  description?: string | null;
  status: string;
  created_at?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at?: string | null;
  created_at?: string;
}

export interface DashboardData {
  wallet: Wallet;
  bonus_balance: number;
  referral_bonus_earned: number;
  total_balance: number;
  total_invested: number;
  active_invested: number;
  total_profit: number;
  pending_withdrawals: number;
  completed_returns: number;
  monthly_growth: number;
  monthly_income: number;
  referral_code?: string | null;
  referrals_count: number;
  referral_chart: { month: string; referrals: number; bonus: number }[];
  recent_transactions: Transaction[];
  active_investments: Investment[];
  chart: { month: string; value: number }[];
}

export interface AdminDashboardData {
  total_balance: number;
  total_invested: number;
  total_profit: number;
  total_bonus_paid: number;
  total_referrals: number;
  total_users: number;
  pending_deposits: number;
  pending_withdrawals: number;
  chart: { month: string; deposits: number; withdrawals: number }[];
  recent_users: User[];
  recent_deposits: Deposit[];
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ReportData {
  range: { from: string; to: string };
  deposits: number;
  withdrawals: number;
  net_cashflow: number;
  profit_paid: number;
  returns_paid: number;
  new_users: number;
  new_investments: number;
  new_investment_volume: number;
  referral_bonus_paid: number;
  transactions_by_type: { type: string; total: number; count: number }[];
}
