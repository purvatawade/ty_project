import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();
    const cleanPhone = phone.replace(/\D/g, '');

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      // Fallback: Simulated Success Mode for Local Dev
      console.log(`[SMS Dev Simulation] To: +91${cleanPhone} | Text: "${message}"`);
      return NextResponse.json({
        success: true,
        message: 'SMS simulated successfully! (Add Twilio credentials for real SMS delivery).'
      });
    }

    const recipient = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams({
      To: recipient,
      From: twilioNumber,
      Body: message
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: data.message || 'Twilio SMS failed' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'SMS server error' }, { status: 500 });
  }
}