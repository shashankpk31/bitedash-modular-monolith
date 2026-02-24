import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { OrderNotificationProvider } from "./context/OrderNotificationContext";
import { Toaster } from "react-hot-toast";
import ReloadPrompt from "./components/ui/ReloadPrompt";
import InstallPrompt from "./components/pwa/InstallPrompt";
import OfflineIndicator from "./components/pwa/OfflineIndicator";
import { notificationService } from "./services/notificationService";

function App() {
  // Request notification permission on first visit
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (notificationService.isSupported() && notificationService.getPermission() === 'default') {
        // Wait a bit before asking for permission (better UX)
        setTimeout(async () => {
          const permission = await notificationService.requestPermission();
          console.log('Notification permission:', permission);
        }, 2000);
      }
    };

    requestNotificationPermission();
  }, []);

  return (
    <AuthProvider>
      <LocationProvider>
        <OrderNotificationProvider>
          <OfflineIndicator />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '1rem',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#ff5200',
                  secondary: '#fff',
                },
              },
            }}
          />
          <ReloadPrompt />
          <InstallPrompt />
        </OrderNotificationProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;