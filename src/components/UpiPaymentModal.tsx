'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  CheckCircle2, 
  IndianRupee, 
  Printer, 
  QrCode,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  tokenNumber: number;
  consultationFee?: number;
  medicineFee?: number;
  upiId?: string; // e.g., '9820000000@paytm' or 'dhanwantri@okicici'
  clinicName?: string;
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  patientName,
  tokenNumber,
  consultationFee = 100,
  medicineFee = 0,
  upiId = '9820000000@paytm',
  clinicName = 'Dhanwantri Clinic'
}: UpiPaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS'>('PENDING');

  if (!isOpen) return null;

  const totalAmount = consultationFee + medicineFee;

  // Standard NPCI UPI URI Scheme
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(clinicName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`OPD Token ${tokenNumber} Bill -${patientName}`)}`;

  const handleMarkAsPaid = () => {
    setPaymentStatus('SUCCESS');
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="p-5 bg-[#0B4632] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">UPI Payment Counter</h3>
              <p className="text-[10px] text-emerald-200">OPD Token Pass #{String(tokenNumber).padStart(2, '0')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-900 text-stone-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6">
          {paymentStatus === 'SUCCESS' ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-stone-900">Payment Confirmed!</h4>
                <p className="text-xs text-stone-500">
                  Received ₹{totalAmount} from <strong className="text-stone-800">{patientName}</strong>
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#0B4632] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close Counter
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ITEMIZED BILL BREAKDOWN */}
              <div className="p-4 rounded-2xl bg-[#F6F4EE] border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Patient Name:</span>
                  <strong className="text-stone-900">{patientName}</strong>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>OPD Consultation Fee:</span>
                  <span className="font-semibold text-stone-900">₹{consultationFee}</span>
                </div>

                {medicineFee > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>In-House Medicines / Procedures:</span>
                    <span className="font-semibold text-stone-900">₹{medicineFee}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-300 flex justify-between items-center text-sm font-black text-[#0B4632]">
                  <span>Total Payable Amount:</span>
                  <span className="text-base font-mono">₹{totalAmount}</span>
                </div>
              </div>

              {/* DYNAMIC SCANNABLE UPI QR CODE */}
              <div className="text-center space-y-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Scan to Pay with GPay, PhonePe, Paytm, or BHIM
                </span>

                <div className="p-4 bg-white border-2 border-dashed border-emerald-600/40 rounded-2xl inline-block shadow-md">
                  <QRCodeSVG
                    value={upiUri}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <p className="text-[11px] text-stone-500 font-medium">
                  UPI VPA: <span className="font-mono font-bold text-stone-800">{upiId}</span>
                </p>
              </div>

              {/* PAYMENT ACTION BUTTONS */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleMarkAsPaid}
                  className="w-full py-3.5 bg-[#0B4632] hover:bg-emerald-900 active:scale-[0.99] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Mark Received (Cash / Scan Completed)</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}