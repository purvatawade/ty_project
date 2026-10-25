export interface QueueItem {
  id: string;
  tokenNumber: number;
  patientName: string;
  mobile: string;
  gender?: string;
  urgency?: string;
  status: 'Waiting' | 'Pending' | 'Checked-In' | 'In-Cabin' | 'In Consultation' | 'Completed';
  createdAt: string;
}

const PRIMARY_KEY = 'dh_patients';
const SECONDARY_KEY = 'arogya_live_queue';

export const getQueue = (): QueueItem[] => {
  if (typeof window === 'undefined') return [];
  
  // Try reading from dh_patients first, then fallback to arogya_live_queue
  const data = localStorage.getItem(PRIMARY_KEY) || localStorage.getItem(SECONDARY_KEY);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item: any) => {
        const rawNum = item.tokenNumber ?? item.token ?? item.id ?? item.token_number ?? '0';
        const parsedNum = parseInt(String(rawNum).replace(/\D/g, ''), 10) || 0;

        return {
          id: item.id || String(parsedNum),
          tokenNumber: parsedNum,
          patientName: item.patientName || item.name || item.patient_name || 'Patient',
          mobile: item.mobile || item.phone || '',
          gender: item.gender || 'Other',
          urgency: item.urgency || item.urgency_level || 'Standard',
          status: item.status === 'Pending' ? 'Waiting' : (item.status || 'Waiting'),
          createdAt: item.createdAt || item.created_at || 'Today',
        };
      })
      .sort((a, b) => a.tokenNumber - b.tokenNumber);
  } catch (e) {
    return [];
  }
};

export const saveBothKeys = (queue: QueueItem[]) => {
  if (typeof window === 'undefined') return;
  const json = JSON.stringify(queue);
  localStorage.setItem(PRIMARY_KEY, json);
  localStorage.setItem(SECONDARY_KEY, json);
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('queue_updated'));
};

export const addToken = (
  patientName: string,
  mobile: string,
  gender: string = 'Male',
  urgency: string = 'Standard'
): QueueItem => {
  const currentQueue = getQueue();
  const lastToken =
    currentQueue.length > 0
      ? Math.max(...currentQueue.map((q) => q.tokenNumber))
      : 0;
  const newTokenNumber = lastToken + 1;

  const newItem: QueueItem = {
    id: String(newTokenNumber),
    tokenNumber: newTokenNumber,
    patientName,
    mobile,
    gender,
    urgency,
    status: 'Waiting',
    createdAt: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updatedQueue = [...currentQueue, newItem];
  saveBothKeys(updatedQueue);
  return newItem;
};

export const updateTokenStatus = (
  tokenNumber: number,
  status: QueueItem['status']
) => {
  if (typeof window === 'undefined') return;
  const currentQueue = getQueue();

  const updatedQueue = currentQueue.map((item) =>
    item.tokenNumber === tokenNumber ? { ...item, status } : item
  );

  saveBothKeys(updatedQueue);
};

export const clearAllQueue = () => {
  saveBothKeys([]);
};