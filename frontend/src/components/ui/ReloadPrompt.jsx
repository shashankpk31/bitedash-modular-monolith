import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="fixed bottom-0 right-0 m-6 z-[100]">
      {(offlineReady || needRefresh) && (
        <div className="bg-white border border-brand-primary p-4 rounded-hb shadow-2xl flex flex-col gap-2">
          <p className="font-bold text-gray-800">
            {offlineReady ? 'App ready to work offline' : 'New version available!'}
          </p>
          <div className="flex gap-2">
            {needRefresh && (
              <button className="bg-brand-primary text-white px-4 py-2 rounded-full text-sm" onClick={() => updateServiceWorker(true)}>
                Update Now
              </button>
            )}
            <button className="border border-gray-200 px-4 py-2 rounded-full text-sm" onClick={close}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReloadPrompt;