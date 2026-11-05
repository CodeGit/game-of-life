import { useRegisterSW } from 'virtual:pwa-register/react';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="reload-prompt" role="status">
      <span>{needRefresh ? 'New version available' : 'Offline ready'}</span>
      {needRefresh && <button onClick={() => updateServiceWorker(true)}>Reload</button>}
      <button onClick={close}>Close</button>
    </div>
  );
}
