import { type NextRequest, NextResponse } from "next/server"
import admin from "firebase-admin"
import axios from "axios"

function getFirebaseApp() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      }),
    })
  }
  return admin.app()
}

export async function GET(request: NextRequest) {
  try {
    const app = getFirebaseApp()
    const db = admin.firestore(app)

    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // Verify payment with Paystack
    const paystackResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const { data } = paystackResponse.data

    // Update payment status in Firebase
    const paymentsQuery = await db.collection("payments").where("paystack_reference", "==", reference).limit(1).get()

    if (!paymentsQuery.empty) {
      const paymentDoc = paymentsQuery.docs[0]
      await paymentDoc.ref.update({
        status: data.status === "success" ? "completed" : "failed",
        paystack_data: data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      const paymentData = paymentDoc.data()

      console.log(`[v0] Payment ${data.status} for ${paymentData.phone} - ${paymentData.bundle}`)

      return NextResponse.json({
        success: data.status === "success",
        transaction: {
          phone: paymentData.phone,
          bundle: paymentData.bundle,
          amount: paymentData.amount,
          status: data.status,
        },
      })
    }

    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  } catch (error: any) {
    console.error("[v0] Payment verification error:", error)

    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
