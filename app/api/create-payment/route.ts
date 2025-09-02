import { type NextRequest, NextResponse } from "next/server"
import admin from "firebase-admin"
import axios from "axios"

// Bundle prices mapping
const bundleAmountMap = {
  // MTN Bundles
  "MTN-1GB": 530,
  "MTN-2GB": 1050,
  "MTN-3GB": 1540,
  "MTN-4GB": 2030,
  "MTN-5GB": 2520,
  "MTN-6GB": 3010,
  "MTN-7GB": 3500,
  "MTN-8GB": 3990,
  "MTN-9GB": 4480,
  "MTN-10GB": 4970,
  "MTN-11GB": 5460,
  "MTN-12GB": 5950,
  "MTN-13GB": 6440,
  "MTN-14GB": 6930,
  "MTN-15GB": 7420,
  "MTN-16GB": 7910,
  "MTN-17GB": 8400,
  "MTN-18GB": 8890,
  "MTN-19GB": 9380,
  "MTN-20GB": 9870,
  "MTN-21GB": 10360,
  "MTN-22GB": 10850,
  "MTN-23GB": 11340,
  "MTN-24GB": 11830,
  "MTN-25GB": 12320,
  "MTN-26GB": 12810,
  "MTN-27GB": 13300,
  "MTN-28GB": 13790,
  "MTN-29GB": 14280,
  "MTN-30GB": 14770,

  // TIGO ISHARE
  "TIGO-1GB": 500,
  "TIGO-2GB": 1000,
  "TIGO-3GB": 1500,
  "TIGO-4GB": 2000,
  "TIGO-5GB": 2500,
  "TIGO-6GB": 3000,
  "TIGO-7GB": 3500,
  "TIGO-8GB": 3900,
  "TIGO-9GB": 4400,
  "TIGO-10GB": 4900,
  "TIGO-11GB": 5400,
  "TIGO-12GB": 5900,
  "TIGO-13GB": 6400,
  "TIGO-14GB": 6900,
  "TIGO-15GB": 7400,
  "TIGO-16GB": 7900,
  "TIGO-17GB": 8400,
  "TIGO-18GB": 8800,
  "TIGO-19GB": 9300,
  "TIGO-20GB": 9800,
  "TIGO-21GB": 10300,
  "TIGO-22GB": 10800,
  "TIGO-23GB": 11300,
  "TIGO-24GB": 11800,
  "TIGO-25GB": 12300,
  "TIGO-26GB": 12800,
  "TIGO-27GB": 13300,
  "TIGO-28GB": 13700,
  "TIGO-29GB": 14200,
  "TIGO-30GB": 14700,

  // TIGO BIG-TIME
  "BIGTIME-15GB": 5700,
  "BIGTIME-20GB": 7100,
  "BIGTIME-25GB": 7600,
  "BIGTIME-30GB": 8000,
  "BIGTIME-40GB": 9000,
  "BIGTIME-50GB": 10000,
  "BIGTIME-100GB": 21000,

  // TELECEL
  "TELECEL-5GB": 2450,
  "TELECEL-10GB": 4500,
  "TELECEL-15GB": 6000,
  "TELECEL-20GB": 8000,
  "TELECEL-25GB": 10000,
  "TELECEL-30GB": 11100,
}

// Function to initialize Firebase
function initializeFirebase() {
  if (!admin.apps.length) {
    // Check if all required environment variables are present
    const requiredEnvVars = ["FIREBASE_PROJECT_ID", "FIREBASE_PRIVATE_KEY", "FIREBASE_CLIENT_EMAIL"]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`)
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE || "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      }),
    })
  }
  return admin.firestore()
}

export async function POST(request: NextRequest) {
  try {
    const db = initializeFirebase()

    const { phone, bundle } = await request.json()

    // Validate input
    if (!phone || !bundle) {
      return NextResponse.json({ error: "Phone number and bundle are required" }, { status: 400 })
    }

    const phoneRegex = /^[0-9]{10,15}$/
    if (!phoneRegex.test(phone.replace(/[\s\-+]/g, ""))) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    const amount = bundleAmountMap[bundle as keyof typeof bundleAmountMap]
    if (!amount) {
      return NextResponse.json({ error: "Invalid bundle selected" }, { status: 400 })
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("[v0] Missing PAYSTACK_SECRET_KEY environment variable")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    if (!process.env.PAYSTACK_SECRET_KEY.startsWith("sk_")) {
      console.error("[v0] Invalid PAYSTACK_SECRET_KEY format")
      return NextResponse.json({ error: "Payment service misconfigured" }, { status: 500 })
    }

    let paystackResponse
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        console.log(`[v0] Attempting Paystack initialization (attempt ${retryCount + 1})`)

        paystackResponse = await axios.post(
          "https://api.paystack.co/transaction/initialize",
          {
            email: `${phone}@datastore4gh.com`,
            amount: amount * 100, // Convert to pesewas (multiply by 100)
            currency: "GHS",
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success`,
            metadata: {
              phone,
              bundle,
              custom_fields: [
                {
                  display_name: "Phone Number",
                  variable_name: "phone_number",
                  value: phone,
                },
                {
                  display_name: "Data Bundle",
                  variable_name: "data_bundle",
                  value: bundle,
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 30000, // Added 30 second timeout
          },
        )

        if (!paystackResponse.data || !paystackResponse.data.status) {
          throw new Error("Invalid response from Paystack")
        }

        if (!paystackResponse.data.data || !paystackResponse.data.data.authorization_url) {
          throw new Error("Missing authorization URL from Paystack")
        }

        break // Success, exit retry loop
      } catch (error: any) {
        retryCount++
        console.error(`[v0] Paystack attempt ${retryCount} failed:`, error.message)

        if (retryCount >= maxRetries) {
          if (error.response?.status === 401) {
            return NextResponse.json({ error: "Payment service authentication failed" }, { status: 500 })
          }

          if (error.response?.status === 400) {
            return NextResponse.json(
              {
                error: error.response.data?.message || "Invalid payment request",
              },
              { status: 400 },
            )
          }

          if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
            return NextResponse.json({ error: "Payment service timeout. Please try again." }, { status: 503 })
          }

          throw error // Re-throw to be caught by outer try-catch
        }

        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
      }
    }

    // Store transaction in Firebase
    const transactionRef = await db.collection("payments").add({
      phone,
      bundle,
      amount,
      status: "pending",
      paystack_reference: paystackResponse.data.data.reference,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(
      `[v0] Payment initialized successfully for ${phone} - ${bundle} - Reference: ${paystackResponse.data.data.reference}`,
    )

    return NextResponse.json({
      checkoutUrl: paystackResponse.data.data.authorization_url,
      reference: paystackResponse.data.data.reference,
    })
  } catch (error: any) {
    console.error("[v0] Payment initialization error:", error)

    if (error.message?.includes("Missing required environment variable")) {
      return NextResponse.json({ error: "Server configuration error. Please contact support." }, { status: 500 })
    }

    if (error.response?.data) {
      return NextResponse.json(
        { error: error.response.data.message || "Payment initialization failed" },
        { status: error.response.status || 500 },
      )
    }

    return NextResponse.json({ error: "Payment service temporarily unavailable. Please try again." }, { status: 503 })
  }
}
