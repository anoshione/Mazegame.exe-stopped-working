
export const vibrate = (type: 'light' | 'medium' | 'heavy' | 'success' | 'failure') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  switch (type) {
    case 'light':
      navigator.vibrate(20);
      break;
    case 'medium':
      navigator.vibrate(45);
      break;
    case 'heavy':
      navigator.vibrate(80);
      break;
    case 'success':
      navigator.vibrate([40, 60, 40]);
      break;
    case 'failure':
      navigator.vibrate([120, 60, 120]);
      break;
  }
};
