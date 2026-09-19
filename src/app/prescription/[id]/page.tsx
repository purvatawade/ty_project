'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateWhatsAppRxLink } from '@/lib/notifications';
import { Printer, HeartPulse, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PrescriptionDetail {
  id: string;
  issue_date: string;
  patient_id: string;
  consultation_id: string;
  patients: {
    full_name: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    allergies: string;
  };
  consultations: {
    symptoms: string;
    diagnosis: string;
    vitals: {
      weight?: string;
    };
  };
  prescription_items: Array<{
    id: string;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
}

export default function PrescriptionSlipPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      if (!id) return;
      setLoading(true);

      const { data: rx, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          issue_date,
          patient_id,
          consultation_id,
          patients (
            full_name,
            phone,
            gender,
            date_of_birth,
            allergies
          ),
          consultations (
            symptoms,
            diagnosis,
            vitals
          ),
          prescription_items (
            id,
            medicine_name,
            dosage,
            frequency,
            duration,
            instructions
          )
        `)
        .eq('id', id)
        .single();

      if (!error && rx) {
        setData(rx as unknown as PrescriptionDetail);
      }
      setLoading(false);
    };

    fetchPrescription();
  }, [id]);

  const getPatientAge = (dobString?: string) => {
    if (!dobString) return 'N/A';
    const birthYear = new Date(dobString).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;
    return isNaN(calculatedAge) || calculatedAge <= 0 ? 'N/A' : `${calculatedAge} Yrs`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-stone-600 font-bold text-xs">
        Generating Prescription Letterhead...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-stone-600 font-bold text-xs">
        Prescription record not found.
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const whatsappUrl = generateWhatsAppRxLink({
    patientName: data.patients?.full_name || 'Patient',
    phone: data.patients?.phone || '',
    tokenNumber: 0,
    doctorName: 'Dr. Sarika B. Singh',
    rxUrl: currentUrl
  });

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 font-sans print:p-0 print:bg-white">
      {/* ACTION BAR (HIDDEN ON PRINT) */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <Link
          href="/doctor"
          className="text-xs font-bold text-stone-600 hover:text-[#0B4632] flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Desk</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* SEND TO WHATSAPP BUTTON */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Prescription on WhatsApp</span>
          </a>

          {/* PRINT / SAVE PDF BUTTON */}
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-[#0B4632] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE LETTERHEAD */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xl print:shadow-none print:border-none print:rounded-none space-y-8">
        
        {/* CLINIC HEADER */}
        <div className="flex justify-between items-start border-b-2 border-[#0B4632] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B4632] text-white flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-emerald-300" />
              </div>
              <h1 className="text-2xl font-black text-[#0B4632] tracking-tight">DHANWANTRI CLINIC</h1>
            </div>
            <p className="text-xs font-bold text-amber-800">Dr. Sarika B. Singh (B.A.M.S.)</p>
            <p className="text-[11px] text-stone-500">Reg. No. 40421 • Integrated Ayurveda & Primary Medical Care</p>
          </div>

          <div className="text-right text-[11px] text-stone-600 space-y-0.5">
            <p className="font-bold text-stone-900">Mira Road (East), Thane</p>
            <p>Shop No. 7, Priyal Enclave</p>
            <p>Ph: +91 98200 00000</p>
            <p className="font-semibold text-[#0B4632]">OPD: 11 AM–2 PM | 7 PM–10 PM</p>
          </div>
        </div>

        {/* PATIENT PARTICULARS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F6F4EE] border border-stone-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase block">Patient Name</span>
            <span className="font-bold text-stone-900">{data.patients?.full_name}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase block">Gender / Age</span>
            <span className="font-bold text-stone-900">{data.patients?.gender} / {getPatientAge(data.patients?.date_of_birth)}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase block">Phone Number</span>
            <span className="font-bold text-stone-900">{data.patients?.phone}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase block">Date</span>
            <span className="font-bold text-stone-900">
              {new Date(data.issue_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* DIAGNOSIS & SYMPTOMS */}
        <div className="space-y-2 border-b border-stone-200 pb-4">
          <div className="flex gap-2 text-xs">
            <strong className="text-stone-700 shrink-0">Diagnosis:</strong>
            <span className="font-bold text-[#0B4632]">{data.consultations?.diagnosis}</span>
          </div>
          <div className="flex gap-2 text-xs text-stone-600">
            <strong className="text-stone-700 shrink-0">Complaints:</strong>
            <span>{data.consultations?.symptoms}</span>
          </div>
        </div>

        {/* RX MEDICATION TABLE */}
        <div className="space-y-4 min-h-[220px]">
          <span className="text-2xl font-black text-[#0B4632] font-serif block">Rx</span>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-300 text-[11px] font-bold uppercase text-stone-500">
                <th className="py-2">#</th>
                <th className="py-2">Medicine Name</th>
                <th className="py-2">Dosage</th>
                <th className="py-2">Frequency</th>
                <th className="py-2">Duration</th>
                <th className="py-2">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-xs">
              {data.prescription_items?.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-3 font-bold text-stone-400">{index + 1}</td>
                  <td className="py-3 font-bold text-stone-900">{item.medicine_name}</td>
                  <td className="py-3 font-semibold text-stone-700">{item.dosage}</td>
                  <td className="py-3 font-semibold text-stone-700">{item.frequency}</td>
                  <td className="py-3 font-semibold text-stone-700">{item.duration}</td>
                  <td className="py-3 text-stone-600">{item.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER SIGNATURE AREA */}
        <div className="pt-12 border-t border-stone-200 flex justify-between items-end">
          <div className="text-[10px] text-stone-400 space-y-0.5">
            <p>Valid without physical stamp when generated electronically.</p>
            <p>ArogyaSetu Medical Cloud Platform</p>
          </div>

          <div className="text-center space-y-1">
            <div className="w-36 h-12 border-b border-stone-400 mx-auto" />
            <p className="text-xs font-bold text-stone-900">Dr. Sarika B. Singh</p>
            <p className="text-[10px] text-stone-500">B.A.M.S. (Mumbai)</p>
          </div>
        </div>
      </div>
    </div>
  );
}