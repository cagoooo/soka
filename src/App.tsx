import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { BookingProvider, useBooking } from './contexts/BookingContext';
import { useSlots } from './hooks/useSlots';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import 'react-loading-skeleton/dist/skeleton.css';

import { SessionSelection } from './components/SessionSelection';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminLoginModal } from './components/AdminLoginModal';
import { submitBooking, type UserDetails } from './services/bookingService';
import './index.css';

// Lazy load heavy components
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const TicketView = lazy(() => import('./components/TicketView').then(module => ({ default: module.TicketView })));

// Loading Component
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '15px' }}>
    <div className="spinner" style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span style={{ color: '#64748b' }}>Loading...</span>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

interface TicketData {
  bookingId: string;
  userDetails: UserDetails;
  selectedSlotIds: string[];
  timestamp?: number; // Added to track when this ticket was created locally
}

const MainContent = () => {
  const { isValid, selection, isAdmin } = useBooking();
  const { slots } = useSlots(); // Get slots for confirmation
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

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
    };

    checkSystemStatus();
  }, []);

  const handleNext = () => {
    if (isValid) setShowForm(true);
  };

  const handleConfirm = async (details: UserDetails) => {
    // 1. Prepare Summary for Confirmation
    const selectedIds: string[] = [];
    if (selection.selectedC) selectedIds.push(selection.selectedC);
    if (selection.selectedD) selectedIds.push(selection.selectedD);
    if (selection.selectedA) selectedIds.push(selection.selectedA);
    if (selection.selectedB) selectedIds.push(selection.selectedB);

    const selectedTitles = selectedIds
      .map(id => {
        const s = slots.find(item => item.id === id);
        return s ? `[${s.type}場-${s.location}] ${s.title}` : null;
      })
      .filter(Boolean)
      .join('\n- ');

    const confirmMessage = `請確認您的報名場次：\n\n- ${selectedTitles}\n\n⚠️ 重要提醒：\n報名成功後，此裝置將會綁定票券，無法再次報名。\n\n確定要送出嗎？`;

    if (!window.confirm(confirmMessage)) {
      return; // User cancelled
    }

    setSubmitting(true);
    const loadingToast = toast.loading('資料送出中...');
    try {
      const bookingId = await submitBooking(selection, details);

      const newTicketData: TicketData = {
        bookingId,
        userDetails: details,
        selectedSlotIds: selectedIds,
        timestamp: Date.now() // Record creation time
      };

      // Save to localStorage to lock device
      localStorage.setItem('soka_ticket_2026', JSON.stringify(newTicketData));

      setTicketData(newTicketData);
      setShowForm(false);

      toast.success('報名成功！您的場次已保留。', { id: loadingToast, duration: 5000 });
    } catch (e: any) {
      console.error(e);
      toast.error(`報名失敗: ${e.message}`, { id: loadingToast, duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = () => {
    // Optional: If you want "Close" to clear the lock, uncomment the next line. 
    // But user requested "binding", so we keep it. 
    // localStorage.removeItem('soka_ticket_2026'); 
    window.location.reload();
  };

  if (ticketData) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Suspense fallback={<Loading />}>
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

  return (
    <div className="container">
      <div className="glass-card">
        <h1>2026 創價・教育 EXPO</h1>
        <h2>教育實踐趴 - 線上選課</h2>
        <p className="description" style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>
          請選擇適合您的場次。<br />
          (A+B 為一組，C 與 D 為獨立項目)
        </p>

        <SessionSelection />

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            className="btn-primary"
            disabled={!isValid}
            style={{ opacity: isValid ? 1 : 0.5, fontSize: '1.2rem', padding: '15px 40px' }}
            onClick={handleNext}
          >
            {isValid ? '下一步：填寫資料' : "創價教育實踐趴 Let's Go！"}
          </button>
        </div>
      </div>

      {showForm && (
        <RegistrationForm
          onSubmit={handleConfirm}
          onCancel={() => setShowForm(false)}
          loading={submitting}
        />
      )}

      {/* Admin Section */}
      {isAdmin && (
        <div style={{
          padding: '30px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          marginTop: '40px',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
        }}>
          <Suspense fallback={<Loading />}>
            <AdminDashboard />
          </Suspense>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
        © 2026 Soka Education EXPO. All rights reserved.
        <br />
        <span
          onClick={() => setShowAdminLogin(true)}
          style={{ cursor: 'pointer', opacity: 0.3, marginTop: '10px', display: 'inline-block' }}
        >
          Admin Access
        </span>
      </footer>

      <AdminLoginModal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
    </div>
  );
};

function App() {
  return (
    <AuthWrapper>
      <BookingProvider>
        <MainContent />
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
