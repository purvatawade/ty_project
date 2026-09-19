export interface NotificationPayload {
  patientName: string;
  phone: string;
  tokenNumber: number;
  clinicName?: string;
  doctorName?: string;
}

/**
 * Formats a WhatsApp message link for OPD token passes
 */
export function generateWhatsAppTokenLink(payload: NotificationPayload): string {
  const cleanPhone = payload.phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const text = `Hello ${payload.patientName}, your OPD Token Pass at ${
    payload.clinicName || 'Dhanwantri Clinic'
  } is *#${String(payload.tokenNumber).padStart(2, '0')}*. Please track your status live or report to reception when called.`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Formats a WhatsApp message link for sending prescriptions directly
 */
export function generateWhatsAppRxLink(
  payload: NotificationPayload & { rxUrl: string }
): string {
  const cleanPhone = payload.phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const text = `Hello ${payload.patientName}, your consultation with ${
    payload.doctorName || 'Dr. Sarika B. Singh'
  } at Dhanwantri Clinic is complete. View & download your digital prescription here: ${
    payload.rxUrl
  }`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Triggers SMS endpoint / share fallback for mobile devices
 */
export async function triggerSmsPrompt(
  payload: NotificationPayload
): Promise<{ success: boolean; message: string }> {
  const cleanPhone = payload.phone.replace(/\D/g, '');
  const message = `Dhanwantri Clinic: Hello ${
    payload.patientName
  }, your live OPD token is #${String(payload.tokenNumber).padStart(
    2,
    '0'
  )}. Thank you!`;

  try {
    const res = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, message }),
    });

    const result = await res.json();

    if (result.success) {
      alert(`Direct SMS Sent to ${cleanPhone}!\n\nMessage: "${message}"`);
      return { success: true, message: 'SMS sent successfully' };
    } else {
      alert(`SMS Gateway Alert: ${result.error || result.message}`);
      return { success: false, message: result.error || result.message };
    }
  } catch (err: any) {
    alert(`Failed to trigger SMS: ${err.message || 'Network error'}`);
    return { success: false, message: err.message };
  }
}