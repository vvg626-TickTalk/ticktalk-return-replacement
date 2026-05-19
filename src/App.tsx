import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomePage } from '@/pages/HomePage';
import { AccountRequestsPage } from '@/pages/account/AccountRequestsPage';
import { AccountRmaDetailPage } from '@/pages/account/AccountRmaDetailPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage';
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminReplacementsPage } from '@/pages/admin/AdminReplacementsPage';
import { AdminReturnsPage } from '@/pages/admin/AdminReturnsPage';
import { AdminRmaDetailPage } from '@/pages/admin/AdminRmaDetailPage';
import { AdminTradeInsPage } from '@/pages/admin/AdminTradeInsPage';
import { ConfirmationPage } from '@/pages/service/ConfirmationPage';
import { OrderDetailPage } from '@/pages/service/OrderDetailPage';
import { OrderLookupPage } from '@/pages/service/OrderLookupPage';
import { PreviewPage } from '@/pages/service/PreviewPage';
import { ReplaceWizardPage } from '@/pages/service/ReplaceWizardPage';
import { ReturnWizardPage } from '@/pages/service/ReturnWizardPage';
import { ServiceHubPage } from '@/pages/service/ServiceHubPage';
import { ServiceContactPage } from '@/pages/service/ServiceContactPage';
import { ServiceLoginPage } from '@/pages/service/ServiceLoginPage';
import { ServiceNewPage } from '@/pages/service/ServiceNewPage';
import { ServiceSignupPage } from '@/pages/service/ServiceSignupPage';
import { TradeInPage } from '@/pages/service/TradeInPage';

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppShell mode="marketing">
            <HomePage />
          </AppShell>
        }
      />

      <Route element={<AppShell mode="service" />}>
        <Route path="/service" element={<ServiceHubPage />} />
        <Route path="/service/new" element={<ServiceNewPage />} />
        <Route path="/service/login" element={<ServiceLoginPage />} />
        <Route path="/service/signup" element={<ServiceSignupPage />} />
        <Route path="/service/contact" element={<ServiceContactPage />} />
        <Route path="/service/order-lookup" element={<OrderLookupPage />} />
        <Route path="/service/order/:orderId" element={<OrderDetailPage />} />
        <Route path="/service/replace/:orderId" element={<ReplaceWizardPage />} />
        <Route path="/service/return/:orderId" element={<ReturnWizardPage />} />
        <Route path="/service/trade-in" element={<TradeInPage />} />
        <Route path="/service/preview" element={<PreviewPage />} />
        <Route path="/service/confirmation" element={<ConfirmationPage />} />
      </Route>

      <Route element={<AppShell mode="account" />}>
        <Route path="/account/requests" element={<AccountRequestsPage />} />
        <Route path="/account/rma/:rmaId" element={<AccountRmaDetailPage />} />
      </Route>

      <Route element={<AppShell mode="admin" />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/returns" element={<AdminReturnsPage />} />
        <Route path="/admin/replacements" element={<AdminReplacementsPage />} />
        <Route path="/admin/trade-ins" element={<AdminTradeInsPage />} />
        <Route path="/admin/rma/:rmaId" element={<AdminRmaDetailPage />} />
        <Route path="/admin/inventory" element={<AdminInventoryPage />} />
        <Route path="/admin/messages" element={<AdminMessagesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
