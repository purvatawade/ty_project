'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  HeartPulse, 
  Printer, 
  Phone, 
  ArrowLeft
} from 'lucide-react';

interface PrescriptionDetails {
  id: string;
  issue_date: string;
  consultations: {
    diagnosis: string;
    symptoms: string;
    vitals: {
      bp?: string;
      pulse?: string;
      temp?: string;
      weight?: string;
    };
  };
  patients: {
    full_name: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    allergies: string;
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

export default function PrintablePrescriptionPage() {
  const params = useParams();
  const rxId = params?.id as string;

  const [data, setData] = useState<PrescriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rxId) return;

    const fetchPrescription = async () => {
      const { data: rx, error } = await supabase
        .from('prescriptions')
        .select(`
          id,
          issue_date,
          consultations (
            diagnosis,
            symptoms,
            vitals
          ),
          patients (
            full_name,
            phone,
            gender,
            date_of_birth,
            allergies
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
        .eq('id', rxId)
        .single();

      if (!error && rx) {
        setData(rx as unknown as PrescriptionDetails);
      }
      setLoading(false);
    };

    fetchPrescription();
  }, [rxId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-stone-600 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <span className="w-3 h-3 rounded-full bg-[#0B4632] animate-ping" />
          <span>Generating Digital Letterhead...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Prescription Record Not Found</h2>
        <p className="text-xs text-stone-500">The requested prescription ID does not exist or has been removed.</p>
        <Link href="/doctor" className="px-5 py-2.5 bg-[#0B4632] text-white text-xs font-bold rounded-xl">
          Return to Doctor Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans p-4 sm:p-8">
      {/* TOP ACTION BAR */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/doctor"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-[#0B4632] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Desk</span>
        </Link>

        <button
          onClick={handlePrint}
          className="px-6 py-2.5 bg-[#0B4632] hover:bg-emerald-950 text-white text-xs font-bold rounded-full shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span>Print Prescription Slip</span>
        </button>
      </div>

      {/* PRINTABLE LETTERHEAD CANVAS */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-stone-200/90 shadow-lg p-8 sm:p-12 space-y-8 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        
        {/* CLINIC HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-[#0B4632] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0B4632] text-white flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-emerald-300" />
              </div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                DHANWANTRI <span className="text-[#0B4632] font-serif italic font-normal">CLINIC</span>
              </h1>
            </div>
            <p className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
              Integrated Ayurveda & General Outpatient Medical Suite
            </p>
            <p className="text-[11px] text-stone-500 max-w-md">
              Shop No. 7, Priyal Enclave, Opp. R. K. Hotel, Near Bharti Park, Mira Road (East), Thane - 401107
            </p>
          </div>

          <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100">
            <h2 className="text-base font-bold text-stone-900">Dr. Sarika B. Singh</h2>
            <p className="text-xs font-bold text-[#0B4632]">B.A.M.S. (Mumbai University, 2000)</p>
            <p className="text-[10px] text-stone-500">Reg. MCIM No. 40421 • 23+ Years Experience</p>
            <p className="text-[10px] text-stone-500 flex items-center sm:justify-end gap-1 pt-1">
              <Phone className="w-3 h-3 text-[#0B4632]" />
              <span>+91 98200 00000</span>
            </p>
          </div>
        </div>

        {/* PATIENT DEMOGRAPHICS & DATE STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F6F4EE] border border-stone-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Patient Name</span>
            <span className="font-bold text-stone-900">{data.patients?.full_name}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Gender / Phone</span>
            <span className="font-semibold text-stone-800">
              {data.patients?.gender} • {data.patients?.phone}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Known Allergies</span>
            <span className="font-bold text-rose-700">{data.patients?.allergies || 'None'}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Issue Date</span>
            <span className="font-bold text-stone-900">{data.issue_date}</span>
          </div>
        </div>

        {/* CLINICAL VITALS GRID */}
        {data.consultations?.vitals && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Recorded Clinical Vitals
            </span>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500 font-medium">BP:</span>
                <span className="font-bold text-stone-900">{data.consultations.vitals.bp || '120/80'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500 font-medium">Pulse:</span>
                <span className="font-bold text-stone-900">{data.consultations.vitals.pulse || '72 bpm'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500 font-medium">Temp:</span>
                <span className="font-bold text-stone-900">{data.consultations.vitals.temp || '98.6 °F'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500 font-medium">Weight:</span>
                <span className="font-bold text-stone-900">{data.consultations.vitals.weight || '65 kg'}</span>
              </div>
            </div>
          </div>
        )}

        {/* DIAGNOSIS SUMMARY */}
        <div className="space-y-1.5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706] block">
            Clinical Diagnosis & Chief Complaints
          </span>
          <p className="text-sm font-bold text-stone-900">{data.consultations?.diagnosis}</p>
          {data.consultations?.symptoms && (
            <p className="text-xs text-stone-600">Symptoms: {data.consultations.symptoms}</p>
          )}
        </div>

        {/* PRESCRIPTION RX TABLE */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <span className="text-2xl font-serif font-black text-[#0B4632]">Rx</span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Prescribed Medication & Dosage Schedule
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine Name</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                {data.prescription_items?.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-bold text-stone-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{item.medicine_name}</td>
                    <td className="py-3 px-3">{item.dosage}</td>
                    <td className="py-3 px-3 font-semibold text-[#0B4632]">{item.frequency}</td>
                    <td className="py-3 px-3">{item.duration}</td>
                    <td className="py-3 px-3 text-stone-600">{item.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIGNATURE & FOOTER */}
        <div className="pt-12 flex items-end justify-between border-t border-stone-200">
          <div className="text-[10px] text-stone-400 space-y-1">
            <p>Generated digitally via ArogyaSetu Cloud Engine.</p>
            <p>Dhanwantri Clinic • Primary Care & Clinical Ayurveda</p>
          </div>

          <div className="text-center space-y-1">
            <div className="w-36 border-b border-stone-400 mb-1 h-12 flex items-end justify-center">
              <span className="font-serif italic text-xs text-stone-400">Dr. Sarika B. Singh</span>
            </div>
            <span className="text-[10px] font-bold text-stone-700 block uppercase">Authorized Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}