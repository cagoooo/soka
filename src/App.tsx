import { useState, useEffect, Suspense } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { BookingProvider, useBooking } from './contexts/BookingContext';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import 'react-loading-skeleton/dist/skeleton.css';

import { SessionSelection } from './components/SessionSelection';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ConfirmBookingModal } from './components/ConfirmBookingModal';
import { RegistrationStatusScreen } from './components/RegistrationStatusScreen';
import { submitBooking, type UserDetails } from './services/bookingService';
import { useRegistrationStatus } from './hooks/useRegistrationStatus';
import './index.css';

// Lazy load heavy components with retry logic for 404 chunk errors
import { lazyRetry } from './utils/lazyImport';
const AdminDashboard = lazyRetry(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })), 'AdminDashboard');
const TicketView = lazyRetry(() => import('./components/TicketView').then(module => ({ default: module.TicketView })), 'TicketView');

import { LoadingScreen } from './components/LoadingScreen';

interface TicketData {
  bookingId: string;
  userDetails: UserDetails;
  selectedSlotIds: string[];
  timestamp?: number; // Added to track when this ticket was created locally
}

const MainContent = () => {
  const { isValid, selection, isAdmin } = useBooking();
  // slots removed as it is now used inside ConfirmBookingModal
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // New State for Custom Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUserDetails, setPendingUserDetails] = useState<UserDetails | null>(null);
  const [viewingTicket, setViewingTicket] = useState(false);

  // Registration Time Limit Hook
  const registrationStatus = useRegistrationStatus();

  // 隱藏式管理員登入：點擊標題 5 次觸發
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [adminLastTapTime, setAdminLastTapTime] = useState(0);

  const handleTitleTap = () => {
    const now = Date.now();
    // 如果距離上次點擊超過 2 秒，重置計數
    if (now - adminLastTapTime > 2000) {
      setAdminTapCount(1);
    } else {
      const newCount = adminTapCount + 1;
      setAdminTapCount(newCount);

      // 達到 5 次點擊，開啟登入視窗
      if (newCount >= 5) {
        setShowAdminLogin(true);
        setAdminTapCount(0);
      }
    }
    setAdminLastTapTime(now);
  };

  // Device Restriction: Check for existing ticket on mount AND check for system reset
  useEffect(() => {
    const checkSystemStatus = async () => {
      const savedTicketStr = localStorage.getItem('soka_ticket_2026');
      if (!savedTicketStr) return;

      let savedTicket: TicketData;
      try {
        savedTicket = JSON.parse(savedTicketStr);
      } catch (e) {
        console.error("Failed to parse saved ticket", e);
        localStorage.removeItem('soka_ticket_2026');
        return;
      }

      // Check system reset time
      try {
        const sysDoc = await getDoc(doc(db, 'system', 'config'));
        if (sysDoc.exists()) {
          const sysData = sysDoc.data();
          if (sysData.lastReset) {
            const lastResetTime = new Date(sysData.lastReset).getTime();
            const ticketTime = savedTicket.timestamp || 0; // Old tickets might not have timestamp

            // If ticket was created BEFORE the last reset, invalidate it
            // We add a small buffer (e.g. 1 min) just in case of slight clock skews, 
            // but generally logic is: Reset Time > Ticket Time => INVALID
            if (lastResetTime > ticketTime) {
              console.log("System reset detected. Clearing local ticket.");
              localStorage.removeItem('soka_ticket_2026');
              setTicketData(null);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to check system status:", err);
        // Fallback: If network fail, trust local data for now
      }

      setTicketData(savedTicket);
      setViewingTicket(true); // Default to showing ticket
    };

    checkSystemStatus();
  }, []);

  const handleNext = () => {
    if (isValid) setShowForm(true);
  };

  // Helper to get selected IDs
  const getSelectedIds = () => {
    const selectedIds: string[] = [];
    if (selection.selectedC) selectedIds.push(selection.selectedC);
    if (selection.selectedD) selectedIds.push(selection.selectedD);
    if (selection.selectedA) selectedIds.push(selection.selectedA);
    if (selection.selectedB) selectedIds.push(selection.selectedB);
    return selectedIds;
  };

  // Step 1: Open Confirmation Modal
  const handleRegistrationSubmit = (details: UserDetails) => {
    setPendingUserDetails(details);
    setShowConfirmModal(true);
  };

  // Step 2: Execute Booking after Modal Confirmation
  const executeBooking = async () => {
    if (!pendingUserDetails) return;

    setShowConfirmModal(false); // Close confirmation modal
    setSubmitting(true);
    const loadingToast = toast.loading('資料送出中...');

    try {
      const bookingId = await submitBooking(selection, pendingUserDetails);
      const selectedIds = getSelectedIds();

      const newTicketData: TicketData = {
        bookingId,
        userDetails: pendingUserDetails,
        selectedSlotIds: selectedIds,
        timestamp: Date.now() // Record creation time
      };

      // Save to localStorage to lock device
      localStorage.setItem('soka_ticket_2026', JSON.stringify(newTicketData));

      setTicketData(newTicketData);
      setViewingTicket(true);
      setShowForm(false);

      toast.success('報名成功！您的場次已保留。', { id: loadingToast, duration: 5000 });
    } catch (e: any) {
      console.error(e);
      toast.error(`報名失敗: ${e.message}`, { id: loadingToast, duration: 5000 });
    } finally {
      setSubmitting(false);
      setPendingUserDetails(null);
    }
  };

  const handleCloseTicket = () => {
    // Optional: If you want "Close" to clear the lock, uncomment the next line. 
    // But user requested "binding", so we keep it. 
    // localStorage.removeItem('soka_ticket_2026'); 
    setViewingTicket(false);
    setTimeout(() => {
      document.getElementById('ticket-access-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (viewingTicket && ticketData) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Suspense fallback={<LoadingScreen />}>
          <TicketView
            bookingId={ticketData.bookingId}
            userDetails={ticketData.userDetails}
            selectedSlotIds={ticketData.selectedSlotIds}
            onClose={handleCloseTicket}
          />
        </Suspense>
      </div>
    );
  }

  // Registration Time Limit Check (Admin bypasses this)
  // Show loading while checking registration status
  if (registrationStatus.status === 'loading') {
    return <LoadingScreen />;
  }

  // If not admin and registration is not open, show status screen
  if (!isAdmin && registrationStatus.status !== 'open') {
    return (
      <RegistrationStatusScreen
        status={registrationStatus.status as 'before' | 'closed'}
        countdown={registrationStatus.countdown}
        openTime={registrationStatus.openTime}
        closeTime={registrationStatus.closeTime}
      />
    );
  }

  return (
    <div className="container">
      <div className="glass-card">
        {/* 點擊標題 5 次可開啟隱藏的管理員登入 */}
        <h1
          onClick={handleTitleTap}
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          2026 創價・教育 EXPO
        </h1>
        <h2>教育實踐趴 - 線上選課</h2>
        <p className="description" style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>
          請選擇適合您的場次。<br />
          (A+B 為一組，C 與 D 為獨立項目)
        </p>

        <SessionSelection
          disabled={!!ticketData}
          bookedSlotIds={ticketData?.selectedSlotIds}
        />

        <div id="ticket-access-section" style={{ textAlign: 'center', marginTop: '30px' }}>
          {ticketData ? (
            <button
              className="btn-primary"
              style={{
                fontSize: '1.2rem',
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Success Green
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                lineHeight: '1.2'
              }}
              onClick={() => setViewingTicket(true)}
            >
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>🎉 已完成報名</span>
              <span style={{ fontWeight: 'bold' }}>查看我的票券 🎫</span>
            </button>
          ) : (
            <button
              className="btn-primary"
              disabled={!isValid}
              style={{ opacity: isValid ? 1 : 0.5, fontSize: '1.2rem', padding: '15px 40px' }}
              onClick={handleNext}
            >
              {isValid ? '下一步：填寫資料' : "創價教育實踐趴 Let's Go！"}
            </button>
          )}
        </div>
      </div>

      {
        showForm && (
          <RegistrationForm
            onSubmit={handleRegistrationSubmit}
            onCancel={() => setShowForm(false)}
            loading={submitting}
          />
        )
      }

      {/* Confirmation Modal */}
      <ConfirmBookingModal
        isOpen={showConfirmModal}
        onConfirm={executeBooking}
        onCancel={() => setShowConfirmModal(false)}
        selectedIds={getSelectedIds()}
      />

      {/* Admin Section */}
      {
        isAdmin && (
          <div style={{
            padding: '30px',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            marginTop: '40px',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
          }}>
            <Suspense fallback={<LoadingScreen />}>
              <AdminDashboard />
            </Suspense>
          </div>
        )
      }

      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
        © 2026 Soka Education EXPO. All rights reserved.
        <br />
        <a
          href="https://cagoooo.github.io/Akai/"
          target="_blank"
          rel="noopener noreferrer"
          className="akai-badge"
        >
          ✨ Made by 阿凱老師
        </a>
      </footer>

      <AdminLoginModal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
    </div >
  );
};

import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <AuthWrapper>
      <BookingProvider>
        <ErrorBoundary>
          <MainContent />
        </ErrorBoundary>
        <Toaster
          position="top-center"
          reverseOrder={false}
          containerStyle={{
            top: 40,
            zIndex: 999999,
          }}
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              zIndex: 999999,
            },
          }}
        />
      </BookingProvider>
    </AuthWrapper>
  );
}

export default App;
