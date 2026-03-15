import { z } from 'zod';
import { EWMClient } from './api-client.js';

interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (client: EWMClient, args: any) => Promise<any>;
}

export const tools: ToolDef[] = [
  // ═══════════════════════════════════════
  // WALLETS
  // ═══════════════════════════════════════

  {
    name: 'wallets_list',
    description: 'List organization wallets with filters',
    inputSchema: z.object({
      entity_id: z.string().optional().describe('entity ID'),
      business_unit_id: z.string().optional().describe('business unit ID'),
      department_id: z.string().optional().describe('department ID'),
      status: z.string().optional().describe('comma-separated statuses'),
      chain: z.string().optional().describe('comma-separated chains'),
      wallet_type: z.string().optional().describe('manual,exchange,custodial,blockchain'),
      search: z.string().optional().describe('search term'),
      page: z.number().optional().describe('page number'),
      limit: z.number().optional().describe('max results (max 100)'),
      sort_by: z.string().optional().describe('sort field'),
      sort_order: z.string().optional().describe('asc or desc'),
      include_balances: z.boolean().optional().describe('include balances'),
    }),
    handler: async (client, args) => client.listWallets(args),
  },
  {
    name: 'wallets_get',
    description: 'Get wallet details by ID',
    inputSchema: z.object({
      id: z.string().describe('wallet ID'),
    }),
    handler: async (client, args) => client.getWallet(args.id),
  },
  {
    name: 'wallets_create',
    description: 'Create a new wallet',
    inputSchema: z.object({
      name: z.string().describe('wallet name'),
      address: z.string().describe('wallet address'),
      chain: z.string().describe('blockchain chain'),
      entity_id: z.string().describe('entity ID'),
      purpose: z.string().optional().describe('wallet purpose'),
      business_unit_id: z.string().optional().describe('business unit ID'),
      department_id: z.string().optional().describe('department ID'),
      cost_center_id: z.string().optional().describe('cost center ID'),
      is_manual: z.boolean().optional().describe('manual wallet flag'),
      manual_balance: z.number().optional().describe('manual balance'),
      manual_balance_symbol: z.string().optional().describe('balance symbol'),
    }),
    handler: async (client, args) => client.createWallet(args),
  },
  {
    name: 'wallets_update',
    description: 'Update wallet properties',
    inputSchema: z.object({
      id: z.string().describe('wallet ID'),
      name: z.string().optional().describe('wallet name'),
      purpose: z.string().optional().describe('wallet purpose'),
      business_unit_id: z.string().optional().describe('business unit ID'),
      department_id: z.string().optional().describe('department ID'),
      cost_center_id: z.string().optional().describe('cost center ID'),
      owner_id: z.string().optional().describe('owner user ID'),
    }),
    handler: async (client, args) => {
      const { id, ...data } = args;
      return client.updateWallet(id, data);
    },
  },
  {
    name: 'wallets_status_update',
    description: 'Change wallet status',
    inputSchema: z.object({
      id: z.string().describe('wallet ID'),
      status: z.enum(['active', 'inactive', 'archived']).describe('new status'),
    }),
    handler: async (client, args) => client.updateWalletStatus(args.id, args.status),
  },
  {
    name: 'wallets_hierarchy',
    description: 'Get wallet tree by org structure',
    inputSchema: z.object({}),
    handler: async (client) => client.getWalletHierarchy(),
  },
  {
    name: 'wallets_stats',
    description: 'Get dashboard statistics',
    inputSchema: z.object({}),
    handler: async (client) => client.getWalletStats(),
  },
  {
    name: 'wallets_assets',
    description: 'Get aggregated asset breakdown',
    inputSchema: z.object({
      entity_id: z.string().optional().describe('entity ID'),
      business_unit_id: z.string().optional().describe('business unit ID'),
      chain: z.string().optional().describe('chain filter'),
      wallet_type: z.string().optional().describe('wallet type'),
      asset_source: z.string().optional().describe('wallets/accounts/all'),
    }),
    handler: async (client, args) => client.getWalletAssets(args),
  },
  {
    name: 'wallets_audit',
    description: 'Get wallet audit log',
    inputSchema: z.object({
      id: z.string().describe('wallet ID'),
    }),
    handler: async (client, args) => client.getWalletAudit(args.id),
  },
  {
    name: 'wallets_submit_approval',
    description: 'Submit wallet for approval',
    inputSchema: z.object({
      id: z.string().describe('wallet ID'),
    }),
    handler: async (client, args) => client.submitWalletForApproval(args.id),
  },
  {
    name: 'wallets_manual_balance',
    description: 'Update manual wallet balance',
    inputSchema: z.object({
      id: z.string().describe('wallet ID'),
      balance: z.number().describe('balance amount'),
      symbol: z.string().describe('token symbol'),
    }),
    handler: async (client, args) => client.updateManualBalance(args.id, args.balance, args.symbol),
  },

  // ═══════════════════════════════════════
  // SIGNATORIES
  // ═══════════════════════════════════════

  {
    name: 'signatories_list',
    description: 'List wallet signatories',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
    }),
    handler: async (client, args) => client.listSignatories(args.wallet_id),
  },
  {
    name: 'signatories_add',
    description: 'Add signatory to wallet',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
      signatory_name: z.string().describe('signatory full name'),
      signatory_email: z.string().describe('signatory email'),
      signatory_type: z.enum(['key_holder', 'backup', 'custodian']).describe('signatory role'),
    }),
    handler: async (client, args) => {
      const { wallet_id, ...data } = args;
      return client.addSignatory(wallet_id, data);
    },
  },
  {
    name: 'signatories_remove',
    description: 'Remove signatory from wallet (soft-delete)',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
      signatory_id: z.string().describe('signatory record ID'),
      reason: z.string().optional().describe('removal reason'),
    }),
    handler: async (client, args) => client.removeSignatory(args.wallet_id, args.signatory_id, args.reason),
  },

  // ═══════════════════════════════════════
  // REVIEWERS
  // ═══════════════════════════════════════

  {
    name: 'reviewers_list',
    description: 'List wallet reviewers',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
    }),
    handler: async (client, args) => client.listReviewers(args.wallet_id),
  },
  {
    name: 'reviewers_add',
    description: 'Add reviewer to wallet',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
      user_id: z.string().describe('reviewer user ID'),
    }),
    handler: async (client, args) => client.addReviewer(args.wallet_id, args.user_id),
  },
  {
    name: 'reviewers_remove',
    description: 'Remove reviewer from wallet',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
      reviewer_id: z.string().describe('reviewer record ID'),
    }),
    handler: async (client, args) => client.removeReviewer(args.wallet_id, args.reviewer_id),
  },

  // ═══════════════════════════════════════
  // SIGNATORIES REPORT
  // ═══════════════════════════════════════

  {
    name: 'signatories_report',
    description: 'Governance report: who signs which wallets',
    inputSchema: z.object({
      signatory_email: z.string().optional().describe('filter by email'),
      signing_type: z.enum(['single_sig', 'multi_sig']).optional().describe('signing type'),
      signatory_status: z.enum(['active', 'pending', 'removed']).optional().describe('status'),
      entity_id: z.string().optional().describe('entity ID'),
      chain: z.string().optional().describe('chain filter'),
    }),
    handler: async (client, args) => client.getSignatoriesReport(args),
  },

  // ═══════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════

  {
    name: 'notifications_list',
    description: 'List user notifications',
    inputSchema: z.object({
      is_read: z.string().optional().describe('true or false'),
      type: z.string().optional().describe('notification type filter'),
      page: z.number().optional().describe('page number'),
      limit: z.number().optional().describe('max results'),
    }),
    handler: async (client, args) => client.listNotifications(args),
  },
  {
    name: 'notifications_unread_count',
    description: 'Get unread notification count',
    inputSchema: z.object({}),
    handler: async (client) => client.getUnreadCount(),
  },
  {
    name: 'notifications_mark_read',
    description: 'Mark a notification as read',
    inputSchema: z.object({
      id: z.string().describe('notification ID'),
    }),
    handler: async (client, args) => client.markNotificationRead(args.id),
  },
  {
    name: 'notifications_mark_all_read',
    description: 'Mark all notifications as read',
    inputSchema: z.object({}),
    handler: async (client) => client.markAllNotificationsRead(),
  },
  {
    name: 'notifications_preferences_get',
    description: 'Get notification channel preferences',
    inputSchema: z.object({}),
    handler: async (client) => client.getNotificationPreferences(),
  },
  {
    name: 'notifications_preferences_update',
    description: 'Update notification preferences',
    inputSchema: z.object({
      in_app_enabled: z.boolean().optional().describe('enable in-app'),
      email_enabled: z.boolean().optional().describe('enable email'),
      slack_enabled: z.boolean().optional().describe('enable Slack'),
      type_overrides: z.record(z.string(), z.any()).optional().describe('per-type overrides'),
    }),
    handler: async (client, args) => client.updateNotificationPreferences(args),
  },

  // ═══════════════════════════════════════
  // ORG NOTIFICATION CONFIG
  // ═══════════════════════════════════════

  {
    name: 'org_notification_config_get',
    description: 'Get org Slack notification config',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
    }),
    handler: async (client, args) => client.getOrgNotificationConfig(args.org_id),
  },
  {
    name: 'org_notification_config_update',
    description: 'Update org Slack notification config',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      slack_webhook_url: z.string().optional().describe('Slack webhook URL'),
      slack_channel_name: z.string().optional().describe('channel name'),
      slack_enabled: z.boolean().optional().describe('enable Slack'),
    }),
    handler: async (client, args) => {
      const { org_id, ...config } = args;
      return client.updateOrgNotificationConfig(org_id, config);
    },
  },
  {
    name: 'org_slack_webhook_test',
    description: 'Test org Slack webhook connection',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      webhook_url: z.string().describe('Slack webhook URL to test'),
    }),
    handler: async (client, args) => client.testOrgSlackWebhook(args.org_id, args.webhook_url),
  },

  // ═══════════════════════════════════════
  // BALANCE (Authenticated)
  // ═══════════════════════════════════════

  {
    name: 'balance_supported_chains',
    description: 'List chains for token sync',
    inputSchema: z.object({}),
    handler: async (client) => client.getBalanceSupportedChains(),
  },
  {
    name: 'balance_get',
    description: 'Get wallet balance',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
      refresh: z.boolean().optional().describe('force refresh'),
    }),
    handler: async (client, args) => client.getWalletBalance(args.wallet_id, args.refresh),
  },
  {
    name: 'balance_refresh',
    description: 'Force refresh wallet balance',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
    }),
    handler: async (client, args) => client.refreshWalletBalance(args.wallet_id),
  },
  {
    name: 'balance_tokens_get',
    description: 'Get all token balances for wallet',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
    }),
    handler: async (client, args) => client.getWalletTokens(args.wallet_id),
  },
  {
    name: 'balance_tokens_sync',
    description: 'Sync wallet token balances',
    inputSchema: z.object({
      wallet_id: z.string().describe('wallet ID'),
    }),
    handler: async (client, args) => client.syncWalletTokens(args.wallet_id),
  },

  // ═══════════════════════════════════════
  // PUBLIC BALANCE (No auth required)
  // ═══════════════════════════════════════

  {
    name: 'public_supported_chains',
    description: 'List all supported chains (public)',
    inputSchema: z.object({}),
    handler: async (client) => client.getPublicSupportedChains(),
  },
  {
    name: 'public_check_support',
    description: 'Check if chain is supported (public)',
    inputSchema: z.object({
      chain: z.string().describe('chain name'),
    }),
    handler: async (client, args) => client.checkPublicSupport(args.chain),
  },
  {
    name: 'public_balance_get',
    description: 'Get address balance on chain (public)',
    inputSchema: z.object({
      address: z.string().describe('wallet address'),
      chain: z.string().describe('chain name'),
      block: z.number().optional().describe('block number'),
      timestamp: z.number().optional().describe('unix timestamp'),
    }),
    handler: async (client, args) =>
      client.getPublicBalance(args.address, args.chain, args.block, args.timestamp),
  },
  {
    name: 'public_block_at_timestamp',
    description: 'Convert timestamp to block number',
    inputSchema: z.object({
      chain: z.string().describe('chain name'),
      timestamp: z.number().describe('unix seconds'),
    }),
    handler: async (client, args) => client.getPublicBlockAtTimestamp(args.chain, args.timestamp),
  },

  // ═══════════════════════════════════════
  // ORGANIZATIONS
  // ═══════════════════════════════════════

  {
    name: 'organizations_list',
    description: 'List user organizations',
    inputSchema: z.object({}),
    handler: async (client) => client.listOrganizations(),
  },
  {
    name: 'organizations_get',
    description: 'Get organization details',
    inputSchema: z.object({
      id: z.string().describe('organization ID'),
    }),
    handler: async (client, args) => client.getOrganization(args.id),
  },
  {
    name: 'organizations_create',
    description: 'Create a new organization',
    inputSchema: z.object({
      name: z.string().describe('organization name'),
      slug: z.string().describe('URL slug'),
    }),
    handler: async (client, args) => client.createOrganization(args),
  },
  {
    name: 'organizations_update',
    description: 'Update organization settings',
    inputSchema: z.object({
      id: z.string().describe('organization ID'),
      name: z.string().optional().describe('org name'),
      balance_refresh_minutes: z.number().optional().describe('refresh interval'),
    }),
    handler: async (client, args) => {
      const { id, ...data } = args;
      return client.updateOrganization(id, data);
    },
  },

  // ═══════════════════════════════════════
  // ENTITIES
  // ═══════════════════════════════════════

  {
    name: 'entities_list',
    description: 'List organization entities',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
    }),
    handler: async (client, args) => client.listEntities(args.org_id),
  },
  {
    name: 'entities_create',
    description: 'Create a legal entity',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      name: z.string().describe('entity name'),
      legal_name: z.string().optional().describe('legal name'),
      country: z.string().optional().describe('country code'),
      base_currency: z.string().optional().describe('currency (default USD)'),
    }),
    handler: async (client, args) => {
      const { org_id, ...data } = args;
      return client.createEntity(org_id, data);
    },
  },
  {
    name: 'entities_get',
    description: 'Get entity details',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      entity_id: z.string().describe('entity ID'),
    }),
    handler: async (client, args) => client.getEntity(args.org_id, args.entity_id),
  },

  // ═══════════════════════════════════════
  // BUSINESS UNITS
  // ═══════════════════════════════════════

  {
    name: 'business_units_list',
    description: 'List business units',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
    }),
    handler: async (client, args) => client.listBusinessUnits(args.org_id),
  },
  {
    name: 'business_units_create',
    description: 'Create a business unit',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      name: z.string().describe('business unit name'),
    }),
    handler: async (client, args) => client.createBusinessUnit(args.org_id, { name: args.name }),
  },

  // ═══════════════════════════════════════
  // DEPARTMENTS
  // ═══════════════════════════════════════

  {
    name: 'departments_list',
    description: 'List departments',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
    }),
    handler: async (client, args) => client.listDepartments(args.org_id),
  },
  {
    name: 'departments_create',
    description: 'Create a department',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      name: z.string().describe('department name'),
    }),
    handler: async (client, args) => client.createDepartment(args.org_id, { name: args.name }),
  },

  // ═══════════════════════════════════════
  // COST CENTERS
  // ═══════════════════════════════════════

  {
    name: 'cost_centers_list',
    description: 'List cost centers',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
    }),
    handler: async (client, args) => client.listCostCenters(args.org_id),
  },
  {
    name: 'cost_centers_create',
    description: 'Create a cost center',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      code: z.string().describe('cost center code'),
      name: z.string().describe('cost center name'),
    }),
    handler: async (client, args) => client.createCostCenter(args.org_id, { code: args.code, name: args.name }),
  },

  // ═══════════════════════════════════════
  // MEMBERS
  // ═══════════════════════════════════════

  {
    name: 'members_list',
    description: 'List organization members',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
    }),
    handler: async (client, args) => client.listMembers(args.org_id),
  },
  {
    name: 'members_add',
    description: 'Add member to organization',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      user_id: z.string().describe('user ID'),
      role: z.enum(['org_admin', 'user', 'viewer']).describe('member role'),
    }),
    handler: async (client, args) => client.addMember(args.org_id, { user_id: args.user_id, role: args.role }),
  },
  {
    name: 'members_invite',
    description: 'Invite member by email',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      email: z.string().describe('email address'),
      role: z.enum(['org_admin', 'user', 'viewer']).describe('member role'),
    }),
    handler: async (client, args) => client.inviteMember(args.org_id, { email: args.email, role: args.role }),
  },
  {
    name: 'members_remove',
    description: 'Remove member from organization',
    inputSchema: z.object({
      org_id: z.string().describe('organization ID'),
      user_id: z.string().describe('user ID'),
    }),
    handler: async (client, args) => client.removeMember(args.org_id, args.user_id),
  },

  // ═══════════════════════════════════════
  // APPROVALS
  // ═══════════════════════════════════════

  {
    name: 'approvals_list',
    description: 'List pending approvals',
    inputSchema: z.object({
      status: z.string().optional().describe('filter by status'),
      my_queue: z.boolean().optional().describe('only my queue'),
    }),
    handler: async (client, args) => client.listApprovals(args),
  },
  {
    name: 'approvals_get',
    description: 'Get approval request details',
    inputSchema: z.object({
      id: z.string().describe('approval ID'),
    }),
    handler: async (client, args) => client.getApproval(args.id),
  },
  {
    name: 'approvals_action',
    description: 'Approve or reject a request',
    inputSchema: z.object({
      id: z.string().describe('approval ID'),
      action: z.enum(['approved', 'rejected']).describe('approve or reject'),
      comment: z.string().optional().describe('comment'),
    }),
    handler: async (client, args) => client.actionApproval(args.id, { action: args.action, comment: args.comment }),
  },
  {
    name: 'approvals_history',
    description: 'Get approval history',
    inputSchema: z.object({
      page: z.number().optional().describe('page number'),
      limit: z.number().optional().describe('max results'),
    }),
    handler: async (client, args) => client.getApprovalHistory(args),
  },
  {
    name: 'approvals_config_get',
    description: 'Get approval configuration',
    inputSchema: z.object({}),
    handler: async (client) => client.getApprovalConfig(),
  },
];
