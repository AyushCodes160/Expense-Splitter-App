import axios from "axios";
import { type SplitTypeKey } from "./strategies/SplitStrategy";

// Define the models based on the backend API
export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatarUrl: string | null;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  description: string;
  splitType: SplitTypeKey;
  date: string;
  splits: ExpenseSplit[];
  payer?: Profile;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amountOwed: number;
  user?: Profile;
}

export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  status: string;
  date: string;
}

export interface MemberBalance {
  user_id: string;
  username: string;
  full_name?: string | null;
  net: number;
}

export interface Friendship {
  friendshipId: string;
  id: string;
  username: string;
  avatarUrl: string | null;
}

export const ProfileService = {
  async getMe(): Promise<Profile> {
    const res = await axios.get("/api/users/me");
    return res.data;
  },

  async update(updates: Partial<Profile>) {
    const res = await axios.put("/api/users/me", updates);
    return res.data;
  },

  async findByUsername(username: string) {
    const res = await axios.get(`/api/users/search?q=${username}`);
    return res.data[0];
  },
};

export const FriendService = {
  async getFriends(): Promise<Friendship[]> {
    const res = await axios.get("/api/friends");
    return res.data;
  },
  
  async sendRequest(friendId: string) {
    const res = await axios.post("/api/friends/request", { friendId });
    return res.data;
  },

  async getPendingRequests() {
    const res = await axios.get("/api/friends/pending");
    return res.data;
  },

  async acceptRequest(requestId: string) {
    const res = await axios.put("/api/friends/accept", { requestId });
    return res.data;
  }
};

export const GroupService = {
  async listMine(): Promise<Group[]> {
    const res = await axios.get("/api/groups");
    return res.data;
  },

  async create(name: string, description?: string): Promise<Group> {
    const res = await axios.post("/api/groups", { name, description });
    return res.data;
  },

  async get(id: string): Promise<Group> {
    const res = await axios.get(`/api/groups/${id}`);
    return res.data;
  },

  async getMembers(groupId: string): Promise<Profile[]> {
    const res = await axios.get(`/api/groups/${groupId}`);
    return res.data.members.map((m: any) => m.user);
  },

  async addMember(groupId: string, friendId: string) {
    const res = await axios.post(`/api/groups/${groupId}/members`, { friendId });
    return res.data;
  },
};

export interface AddExpenseInput {
  groupId: string;
  amount: number;
  description: string;
  date?: string;
  splitType: SplitTypeKey;
  participantIds: string[];
  shares?: Record<string, number>;
}

export const ExpenseService = {
  async listByGroup(groupId: string): Promise<Expense[]> {
    const res = await axios.get(`/api/expenses/group/${groupId}`);
    return res.data;
  },

  async listMine(): Promise<Expense[]> {
    // For simplicity, just return empty list or build this route in backend
    return [];
  },

  async add(input: AddExpenseInput): Promise<Expense> {
    const res = await axios.post("/api/expenses", input);
    return res.data;
  },

  async delete(expenseId: string) {
    const res = await axios.delete(`/api/expenses/${expenseId}`);
    return res.data;
  },
};

export const BalanceService = {
  async getGroupBalances(groupId: string): Promise<MemberBalance[]> {
    const res = await axios.get(`/api/settlements/group/${groupId}/balances`);
    return res.data;
  },

  async getSimplifiedSettlements(groupId: string) {
    const res = await axios.get(`/api/settlements/group/${groupId}/simplified`);
    return res.data;
  },

  async getMyTotals() {
    const res = await axios.get("/api/settlements/me/balances");
    return res.data;
  },
};

export const SettlementService = {
  async record(groupId: string, payeeId: string, amount: number) {
    const res = await axios.post("/api/settlements/pay", { groupId, payeeId, amount });
    return res.data;
  },
};

export function formatMoney(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}
