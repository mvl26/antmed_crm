import { createRouter, createWebHistory } from 'vue-router'
import { usersStore } from '@/stores/users'
import { sessionStore } from '@/stores/session'
import { viewsStore } from '@/stores/views'
import { isAntmedUser, isAntmedPath } from '@/utils/antmed'
import { shouldRedirectNotPermitted } from '@/utils/antmedGuard'

// T4 — màn prototype dùng chung 1 stub tới khi T5–T14 dựng màn thật.
const antmedStub = () => import('@/pages/Antmed/AntmedScreenStub.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/pages/MobileNotification.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
  },
  {
    alias: '/leads',
    path: '/leads/view/:viewType?',
    name: 'Leads',
    component: () => import('@/pages/Leads.vue'),
  },
  {
    path: '/leads/:leadId',
    name: 'Lead',
    component: () => import(`@/pages/${handleMobileView('Lead')}.vue`),
    props: true,
  },
  {
    alias: '/deals',
    path: '/deals/view/:viewType?',
    name: 'Deals',
    component: () => import('@/pages/Deals.vue'),
  },
  {
    path: '/deals/:dealId',
    name: 'Deal',
    component: () => import(`@/pages/${handleMobileView('Deal')}.vue`),
    props: true,
  },
  {
    alias: '/notes',
    path: '/notes/view/:viewType?',
    name: 'Notes',
    component: () => import('@/pages/Notes.vue'),
  },
  {
    alias: '/tasks',
    path: '/tasks/view/:viewType?',
    name: 'Tasks',
    component: () => import('@/pages/Tasks.vue'),
  },
  {
    alias: '/contacts',
    path: '/contacts/view/:viewType?',
    name: 'Contacts',
    component: () => import('@/pages/Contacts.vue'),
  },
  {
    path: '/contacts/:contactId',
    name: 'Contact',
    component: () => import(`@/pages/${handleMobileView('Contact')}.vue`),
    props: true,
  },
  {
    alias: '/organizations',
    path: '/organizations/view/:viewType?',
    name: 'Organizations',
    component: () => import('@/pages/Organizations.vue'),
  },
  {
    path: '/organizations/:organizationId',
    name: 'Organization',
    component: () => import(`@/pages/${handleMobileView('Organization')}.vue`),
    props: true,
  },
  {
    alias: '/call-logs',
    path: '/call-logs/view/:viewType?',
    name: 'Call Logs',
    component: () => import('@/pages/CallLogs.vue'),
  },
  {
    path: '/data-import',
    name: 'DataImportList',
    component: () => import('@/pages/DataImport.vue'),
  },
  {
    path: '/data-import/doctype/:doctype',
    name: 'NewDataImport',
    component: () => import('@/pages/DataImport.vue'),
    props: true,
  },
  {
    path: '/data-import/:importName',
    name: 'DataImport',
    component: () => import('@/pages/DataImport.vue'),
    props: true,
  },
  {
    path: '/antmed',
    name: 'AntmedHome',
    component: () => import('@/pages/AntmedHome.vue'),
  },
  {
    path: '/antmed/hospitals',
    name: 'AntmedHospitalList',
    component: () => import('@/pages/AntmedHospitalList.vue'),
  },
  {
    path: '/antmed/contracts',
    name: 'AntmedContracts',
    component: () => import('@/pages/AntmedContracts.vue'),
  },
  {
    path: '/antmed/contracts/:name',
    name: 'AntmedContractDetail',
    component: () => import('@/pages/AntmedContractDetail.vue'),
    props: true,
  },
  {
    path: '/antmed/hospitals/:name',
    name: 'AntmedHospitalDetail',
    component: () => import('@/pages/AntmedHospitalDetail.vue'),
    props: true,
  },
  {
    path: '/antmed/doctors/:name',
    name: 'AntmedDoctorDetail',
    component: () => import('@/pages/AntmedDoctorDetail.vue'),
    props: true,
  },

  // ── T4: 24 màn prototype role-prefixed (mockup AntMed). meta.antmedShell ⇒
  // render trong AntmedLayout (App.vue). meta.role ⇒ sidebar role-aware (T3).
  // Non-destructive: A1=/ceo, KHÔNG hijack Home '/'. Stub → T5–T14 thay màn thật.
  { path: '/ceo', name: 'AntmedCeoDashboard', meta: { antmedShell: true, role: 'ceo' }, component: antmedStub },
  { path: '/ceo/contract-health', name: 'AntmedContractHealth', meta: { antmedShell: true, role: 'ceo' }, component: antmedStub },
  { path: '/ceo/revenue', name: 'AntmedRevenue', meta: { antmedShell: true, role: 'ceo' }, component: antmedStub },
  { path: '/sales/dispatch', name: 'AntmedDispatch', meta: { antmedShell: true, role: 'sales' }, component: antmedStub },
  { path: '/sales/team', name: 'AntmedTeam', meta: { antmedShell: true, role: 'sales' }, component: antmedStub },
  { path: '/sales/approvals', name: 'AntmedApprovals', meta: { antmedShell: true, role: 'sales' }, component: antmedStub },
  { path: '/rep', name: 'AntmedRepHome', meta: { antmedShell: true, role: 'rep' }, component: antmedStub },
  { path: '/rep/wizard', name: 'AntmedDeliveryWizard', meta: { antmedShell: true, role: 'rep' }, component: antmedStub },
  { path: '/rep/checklist', name: 'AntmedInstrumentChecklist', meta: { antmedShell: true, role: 'rep' }, component: antmedStub },
  { path: '/rep/doctor', name: 'AntmedRepDoctor', meta: { antmedShell: true, role: 'rep' }, component: antmedStub },
  { path: '/rep/offline', name: 'AntmedOffline', meta: { antmedShell: true, role: 'rep' }, component: antmedStub },
  { path: '/warehouse/export', name: 'AntmedWarehouseExport', meta: { antmedShell: true, role: 'warehouse' }, component: antmedStub },
  { path: '/warehouse/consignment', name: 'AntmedConsignment', meta: { antmedShell: true, role: 'warehouse' }, component: antmedStub },
  { path: '/warehouse/lot-trace', name: 'AntmedLotTrace', meta: { antmedShell: true, role: 'warehouse' }, component: antmedStub },
  { path: '/docs/pending', name: 'AntmedDocsPending', meta: { antmedShell: true, role: 'docs' }, component: antmedStub },
  { path: '/docs/co-cq', name: 'AntmedCoCq', meta: { antmedShell: true, role: 'docs' }, component: antmedStub },
  { path: '/docs/reconciliation', name: 'AntmedReconciliation', meta: { antmedShell: true, role: 'docs' }, component: antmedStub },
  { path: '/finance/receivables', name: 'AntmedReceivables', meta: { antmedShell: true, role: 'finance' }, component: antmedStub },
  { path: '/finance/commission', name: 'AntmedCommission', meta: { antmedShell: true, role: 'finance' }, component: antmedStub },
  { path: '/portal', name: 'AntmedPortalHome', meta: { antmedShell: true, role: 'portal' }, component: antmedStub },
  { path: '/portal/history', name: 'AntmedPortalHistory', meta: { antmedShell: true, role: 'portal' }, component: antmedStub },
  { path: '/admin/users', name: 'AntmedUsers', meta: { antmedShell: true, role: 'admin' }, component: antmedStub },
  { path: '/admin/audit', name: 'AntmedAudit', meta: { antmedShell: true, role: 'admin' }, component: antmedStub },
  { path: '/instruments', name: 'AntmedInstruments', meta: { antmedShell: true, role: 'warehouse' }, component: antmedStub },

  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('@/pages/Welcome.vue'),
  },
  {
    path: '/:invalidpath',
    name: 'Invalid Page',
    component: () => import('@/pages/InvalidPage.vue'),
  },
  {
    path: '/not-permitted',
    name: 'Not Permitted',
    component: () => import('@/pages/NotPermitted.vue'),
  },
]

const handleMobileView = (componentName) => {
  return window.innerWidth < 768 ? `Mobile${componentName}` : componentName
}

let router = createRouter({
  history: createWebHistory('/crm'),
  routes,
})

router.beforeEach(async (to, from, next) => {
  router.previousRoute = from

  const { isLoggedIn } = sessionStore()
  const { users, isCrmUser } = usersStore()

  if (isLoggedIn && !users.fetched) {
    try {
      await users.promise
    } catch (error) {
      console.error('Error loading users', error)
    }
  }

  // [W0-2 / DEC-B Gate-3] allow-check ADDITIVE: route /antmed/* cho phép CRM HOẶC AntMed user;
  // route CRM gốc GIỮ NGUYÊN `isCrmUser()` (AntMed-thuần vẫn bị chặn → no-regression).
  if (
    isLoggedIn &&
    to.name !== 'Not Permitted' &&
    shouldRedirectNotPermitted(to, { isCrmUser, isAntmedUser })
  ) {
    next({ name: 'Not Permitted' })
  } else if (to.name === 'Home' && isLoggedIn) {
    // AntMed-thuần (không phải CRM user) → landing thẳng SPA AntMed, KHÔNG vào logic default-view CRM.
    if (!isCrmUser() && isAntmedUser()) {
      next({ name: 'AntmedHome' })
      return
    }
    const { views, getDefaultView } = viewsStore()
    await views.promise

    let defaultView = getDefaultView()
    if (!defaultView) {
      next({ name: 'Leads' })
      return
    }

    let { route_name, type, name, is_standard } = defaultView
    route_name = route_name || 'Leads'

    if (name && !is_standard) {
      next({
        name: route_name,
        params: { viewType: type },
        query: { view: name },
      })
    } else {
      next({ name: route_name, params: { viewType: type } })
    }
  } else if (!isLoggedIn) {
    window.location.href = '/login?redirect-to=/crm'
  } else if (to.matched.length === 0) {
    next({ name: 'Invalid Page' })
  } else if (['Deal', 'Lead'].includes(to.name) && !to.hash) {
    let storageKey = to.name === 'Deal' ? 'lastDealTab' : 'lastLeadTab'
    const activeTab = localStorage.getItem(storageKey) || 'activity'
    const hash = '#' + activeTab
    next({ ...to, hash })
  } else if (
    [
      'Leads',
      'Deals',
      'Contacts',
      'Organizations',
      'Notes',
      'Tasks',
      'Call Logs',
    ].includes(to.name) &&
    !to.query?.view
  ) {
    const { views, standardViews, getDefaultView } = viewsStore()
    await views.promise

    const viewType = to.params?.viewType ?? ''
    const standardViewTypes = ['list', 'kanban', 'group_by']

    if (!viewType) {
      const doctypeMap = {
        Leads: 'CRM Lead',
        Deals: 'CRM Deal',
        Contacts: 'Contact',
        Organizations: 'CRM Organization',
        Notes: 'FCRM Note',
        Tasks: 'CRM Task',
        'Call Logs': 'CRM Call Log',
      }

      const doctype = doctypeMap[to.name]
      let defaultViewType = 'list'

      let globalDefault = getDefaultView()
      if (globalDefault && globalDefault.route_name === to.name) {
        defaultViewType = globalDefault.type || 'list'
        if (globalDefault.name && !globalDefault.is_standard) {
          next({
            name: to.name,
            params: { viewType: defaultViewType },
            query: { ...to.query, view: globalDefault.name },
          })
          return
        }
      }

      for (const viewType of standardViewTypes) {
        const standardView = standardViews.value?.[doctype + ' ' + viewType]
        if (standardView?.is_default) {
          defaultViewType = viewType
          break
        }
      }

      next({
        name: to.name,
        params: { viewType: defaultViewType },
        query: to.query,
      })
    } else if (!standardViewTypes.includes(viewType)) {
      const viewNameOrLabel = viewType

      let view = views.data?.find(
        (v) => v.name == viewNameOrLabel || v.label === viewNameOrLabel,
      )

      if (view) {
        next({
          name: to.name,
          params: { viewType: view.type || 'list' },
          query: { ...to.query, view: view.name },
        })
      } else {
        next({
          name: to.name,
          params: { viewType: 'list' },
          query: to.query,
        })
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
