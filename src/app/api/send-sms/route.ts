import { NextResponse } from 'next/server';

// Default Doctor Credentials
const DOCTOR_CREDENTIALS = {
  id: 'doctor',
  password: 'admin',
};

// Simulated Database Access (Connect your DB query or ORM like Prisma/Mongoose here)
// e.g., const user = await db.patient.findUnique({ where: { mobile } });
const mockPatientDatabase: Record<string, string> = {};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, role, identifier, password } = body;

    // --- DOCTOR / ADMIN AUTHENTICATION ---
    if (role === 'doctor') {
      if (
        identifier.trim() === DOCTOR_CREDENTIALS.id &&
        password === DOCTOR_CREDENTIALS.password
      ) {
        return NextResponse.json({
          success: true,
          message: 'Doctor authenticated successfully',
          role: 'doctor',
          user: { id: 'doctor', name: 'Dr. Sarika B. Singh' },
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid Doctor ID or password. Default: ID: doctor, Password: admin',
          },
          { status: 401 }
        );
      }
    }

    // --- PATIENT AUTHENTICATION ---
    if (role === 'patient') {
      // 1. PATIENT SIGN UP
      if (action === 'signup') {
        // Check if patient mobile already exists in DB
        const existingPassword = mockPatientDatabase[identifier];

        if (existingPassword) {
          return NextResponse.json(
            {
              success: false,
              message: 'Mobile number already registered! Please sign in instead.',
            },
            { status: 400 }
          );
        }

        // Save new patient record to database
        mockPatientDatabase[identifier] = password;

        return NextResponse.json({
          success: true,
          message: 'Patient registered successfully in database!',
          role: 'patient',
          patientId: identifier,
        });
      }

      // 2. PATIENT SIGN IN
      if (action === 'signin') {
        const storedPassword = mockPatientDatabase[identifier];

        // Case A: Patient does not exist in DB
        if (!storedPassword) {
          return NextResponse.json(
            {
              success: false,
              message: 'Patient record not found in database. Please sign up first.',
              requiresSignup: true,
            },
            { status: 404 }
          );
        }

        // Case B: Incorrect Password
        if (storedPassword !== password) {
          return NextResponse.json(
            {
              success: false,
              message: 'Incorrect password! Please check your password or re-register.',
              requiresSignup: true,
            },
            { status: 401 }
          );
        }

        // Case C: Valid Credentials Match
        return NextResponse.json({
          success: true,
          message: 'Patient authenticated successfully!',
          role: 'patient',
          patientId: identifier,
        });
      }
    }

    return NextResponse.json(
      { success: false, message: 'Invalid authentication request' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server authentication error' },
      { status: 500 }
    );
  }
}