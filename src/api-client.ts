/**
 * Enterprise Wallet Manager API Client
 * Auth: X-API-Key header (ewm_live_XXXX format)
 * Base URL: configurable, defaults to production
 */

const DEFAULT_BASE_URL = 'https://enterprisewalletmanagerbackend-production.up.railway.app/api';

export class EWMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params } = options;
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'X-API-Key': this.apiKey,
      'Accept': 'application/json',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 204) return {} as T;

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    return response.json();
  }

  // === Wallets ===

  async listWallets(params?: {
    entity_id?: string;
    business_unit_id?: string;
    department_id?: string;
    cost_center_id?: string;
    status?: string;
    chain?: string;
    wallet_type?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
    include_balances?: boolean;
  }) {
    return this.request<any>('/wallets', { params: params as any });
  }

  async getWallet(id: string) {
    return this.request<any>(`/wallets/${encodeURIComponent(id)}`);
  }

  async createWallet(data: {
    name: string;
    purpose?: string;
    address: string;
    chain: string;
    entity_id: string;
    business_unit_id?: string;
    department_id?: string;
    cost_center_id?: string;
    is_manual?: boolean;
    manual_balance?: number;
    manual_balance_symbol?: string;
  }) {
    return this.request<any>('/wallets', { method: 'POST', body: data });
  }

  async updateWallet(id: string, data: {
    name?: string;
    purpose?: string;
    business_unit_id?: string;
    department_id?: string;
    cost_center_id?: string;
    owner_id?: string;
  }) {
    return this.request<any>(`/wallets/${encodeURIComponent(id)}`, { method: 'PUT', body: data });
  }

  async updateWalletStatus(id: string, status: string) {
    return this.request<any>(`/wallets/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  async getWalletHierarchy() {
    return this.request<any>('/wallets/hierarchy');
  }

  async getWalletStats() {
    return this.request<any>('/wallets/stats');
  }

  async getWalletAssets(params?: {
    entity_id?: string;
    business_unit_id?: string;
    chain?: string;
    wallet_type?: string;
    asset_source?: string;
  }) {
    return this.request<any>('/wallets/assets', { params: params as any });
  }

  async getWalletAudit(id: string) {
    return this.request<any>(`/wallets/${encodeURIComponent(id)}/audit`);
  }

  async submitWalletForApproval(id: string) {
    return this.request<any>(`/wallets/${encodeURIComponent(id)}/submit`, { method: 'POST' });
  }

  async updateManualBalance(id: string, balance: number, symbol: string) {
    return this.request<any>(`/wallets/${encodeURIComponent(id)}/manual-balance`, {
      method: 'PUT',
      body: { balance, symbol },
    });
  }

  // === Balance ===

  async getBalanceSupportedChains() {
    return this.request<any>('/balance/supported-chains');
  }

  async getWalletBalance(walletId: string, refresh?: boolean) {
    return this.request<any>(`/balance/${encodeURIComponent(walletId)}`, {
      params: refresh ? { refresh: true } : undefined,
    });
  }

  async refreshWalletBalance(walletId: string) {
    return this.request<any>(`/balance/${encodeURIComponent(walletId)}/refresh`, { method: 'POST' });
  }

  async getWalletTokens(walletId: string) {
    return this.request<any>(`/balance/${encodeURIComponent(walletId)}/tokens`);
  }

  async syncWalletTokens(walletId: string) {
    return this.request<any>(`/balance/${encodeURIComponent(walletId)}/sync-tokens`, { method: 'POST' });
  }

  // === Public Balance (no auth needed, but works with key too) ===

  async getPublicSupportedChains() {
    return this.request<any>('/public/supported-chains');
  }

  async checkPublicSupport(chain: string) {
    return this.request<any>('/public/check-support', { params: { chain } });
  }

  async getPublicBalance(address: string, chain: string, block?: number, timestamp?: number) {
    return this.request<any>('/public/balances', {
      params: { address, chain, block, timestamp },
    });
  }

  async getPublicBlockAtTimestamp(chain: string, timestamp: number) {
    return this.request<any>('/public/block-at-timestamp', {
      params: { chain, timestamp },
    });
  }

  // === Organizations ===

  async listOrganizations() {
    return this.request<any>('/organizations');
  }

  async getOrganization(id: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(id)}`);
  }

  async createOrganization(data: { name: string; slug: string; settings?: any }) {
    return this.request<any>('/organizations', { method: 'POST', body: data });
  }

  async updateOrganization(id: string, data: { name?: string; settings?: any; balance_refresh_minutes?: number }) {
    return this.request<any>(`/organizations/${encodeURIComponent(id)}`, { method: 'PUT', body: data });
  }

  // === Entities ===

  async listEntities(orgId: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/entities`);
  }

  async createEntity(orgId: string, data: { name: string; legal_name?: string; country?: string; base_currency?: string }) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/entities`, { method: 'POST', body: data });
  }

  async getEntity(orgId: string, entityId: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/entities/${encodeURIComponent(entityId)}`);
  }

  // === Business Units ===

  async listBusinessUnits(orgId: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/business-units`);
  }

  async createBusinessUnit(orgId: string, data: { name: string }) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/business-units`, { method: 'POST', body: data });
  }

  // === Departments ===

  async listDepartments(orgId: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/departments`);
  }

  async createDepartment(orgId: string, data: { name: string }) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/departments`, { method: 'POST', body: data });
  }

  // === Cost Centers ===

  async listCostCenters(orgId: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/cost-centers`);
  }

  async createCostCenter(orgId: string, data: { code: string; name: string }) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/cost-centers`, { method: 'POST', body: data });
  }

  // === Members ===

  async listMembers(orgId: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/members`);
  }

  async addMember(orgId: string, data: { user_id: string; role: string }) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/members`, { method: 'POST', body: data });
  }

  async inviteMember(orgId: string, data: { email: string; role: string }) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/members/invite`, { method: 'POST', body: data });
  }

  async updateMemberRole(orgId: string, userId: string, role: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: { role },
    });
  }

  async removeMember(orgId: string, userId: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  // === Signatories ===

  async listSignatories(walletId: string) {
    return this.request<any>(`/wallets/${encodeURIComponent(walletId)}/signatories`);
  }

  async addSignatory(walletId: string, data: { signatory_name: string; signatory_email: string; signatory_type: string }) {
    return this.request<any>(`/wallets/${encodeURIComponent(walletId)}/signatories`, { method: 'POST', body: data });
  }

  async removeSignatory(walletId: string, signatoryId: string, reason?: string) {
    return this.request<any>(
      `/wallets/${encodeURIComponent(walletId)}/signatories/${encodeURIComponent(signatoryId)}`,
      { method: 'DELETE', body: reason ? { reason } : undefined }
    );
  }

  // === Reviewers ===

  async listReviewers(walletId: string) {
    return this.request<any>(`/wallets/${encodeURIComponent(walletId)}/reviewers`);
  }

  async addReviewer(walletId: string, userId: string) {
    return this.request<any>(`/wallets/${encodeURIComponent(walletId)}/reviewers`, { method: 'POST', body: { user_id: userId } });
  }

  async removeReviewer(walletId: string, reviewerId: string) {
    return this.request<any>(
      `/wallets/${encodeURIComponent(walletId)}/reviewers/${encodeURIComponent(reviewerId)}`,
      { method: 'DELETE' }
    );
  }

  // === Signatories Report ===

  async getSignatoriesReport(params?: {
    signatory_email?: string;
    signing_type?: string;
    signatory_status?: string;
    entity_id?: string;
    chain?: string;
  }) {
    return this.request<any>('/wallets/signatories-report', { params: params as any });
  }

  // === Notifications ===

  async listNotifications(params?: { is_read?: string; type?: string; page?: number; limit?: number }) {
    return this.request<any>('/notifications', { params: params as any });
  }

  async getUnreadCount() {
    return this.request<any>('/notifications/unread-count');
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request<any>('/notifications/read-all', { method: 'PUT' });
  }

  async getNotificationPreferences() {
    return this.request<any>('/notifications/preferences');
  }

  async updateNotificationPreferences(prefs: {
    in_app_enabled?: boolean;
    email_enabled?: boolean;
    slack_enabled?: boolean;
    type_overrides?: Record<string, any>;
  }) {
    return this.request<any>('/notifications/preferences', { method: 'PUT', body: prefs });
  }

  // === Organization Notification Config ===

  async getOrgNotificationConfig(orgId: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/notification-config`);
  }

  async updateOrgNotificationConfig(orgId: string, config: {
    slack_webhook_url?: string;
    slack_channel_name?: string;
    slack_enabled?: boolean;
  }) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/notification-config`, { method: 'PUT', body: config });
  }

  async testOrgSlackWebhook(orgId: string, webhookUrl: string) {
    return this.request<any>(`/organizations/${encodeURIComponent(orgId)}/notification-config/test`, {
      method: 'POST',
      body: { webhook_url: webhookUrl },
    });
  }

  // === Approvals ===

  async listApprovals(params?: { status?: string; my_queue?: boolean }) {
    return this.request<any>('/approvals', { params: params as any });
  }

  async getApproval(id: string) {
    return this.request<any>(`/approvals/${encodeURIComponent(id)}`);
  }

  async actionApproval(id: string, data: { action: string; comment?: string }) {
    return this.request<any>(`/approvals/${encodeURIComponent(id)}/action`, { method: 'POST', body: data });
  }

  async getApprovalHistory(params?: { page?: number; limit?: number }) {
    return this.request<any>('/approvals/history/all', { params: params as any });
  }

  async getApprovalConfig() {
    return this.request<any>('/approvals/config');
  }
}
