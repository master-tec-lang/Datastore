"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Home } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [transactionData, setTransactionData] = useState<any>(null)

  const reference = searchParams.get("reference")

  useEffect(() => {
    if (reference) {
      verifyPayment(reference)
    } else {
      setStatus("failed")
    }
  }, [reference])

  const verifyPayment = async (ref: string) => {
    try {
      const response = await fetch(`/api/verify-payment?reference=${ref}`)
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setTransactionData(data.transaction)
      } else {
        setStatus("failed")
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setStatus("failed")
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600 text-center">Please wait while we confirm your transaction...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "success" ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-green-700">Payment Successful!</CardTitle>
              <CardDescription>Your data bundle purchase was completed successfully.</CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-700">Payment Failed</CardTitle>
              <CardDescription>There was an issue processing your payment.</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && transactionData && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Transaction Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Phone:</span> {transactionData.phone}
                </p>
                <p>
                  <span className="font-medium">Bundle:</span> {transactionData.bundle}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> GHS {(transactionData.amount / 100).toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Reference:</span> {reference}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            {status === "failed" && (
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Try Again
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
