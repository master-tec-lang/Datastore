"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, Wifi, CreditCard } from "lucide-react"

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

// Group bundles by provider
const bundlesByProvider = {
  MTN: Object.keys(bundleAmountMap).filter((key) => key.startsWith("MTN-")),
  TIGO: Object.keys(bundleAmountMap).filter((key) => key.startsWith("TIGO-")),
  "TIGO BIG-TIME": Object.keys(bundleAmountMap).filter((key) => key.startsWith("BIGTIME-")),
  TELECEL: Object.keys(bundleAmountMap).filter((key) => key.startsWith("TELECEL-")),
}

export default function DataStore() {
  const [phone, setPhone] = useState("")
  const [bundle, setBundle] = useState("MTN-1GB")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, bundle }),
      })

      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert("Payment initialization failed. Please try again.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAmount = bundleAmountMap[bundle as keyof typeof bundleAmountMap]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wifi className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Datastore4GH</h1>
          </div>
          <p className="text-gray-600">Buy Data Bundles & AFA Registration</p>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Purchase Data Bundle
            </CardTitle>
            <CardDescription>Select your preferred data bundle and complete payment via Paystack</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phone">Recipient Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 0241234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="text-lg"
                />
              </div>

              {/* Bundle Selection */}
              <div className="space-y-2">
                <Label htmlFor="bundle">Choose Data Bundle</Label>
                <Select value={bundle} onValueChange={setBundle}>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Select a bundle" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(bundlesByProvider).map(([provider, bundles]) => (
                      <div key={provider}>
                        <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">{provider}</div>
                        {bundles.map((bundleKey) => (
                          <SelectItem key={bundleKey} value={bundleKey}>
                            {bundleKey} - GHS{" "}
                            {(bundleAmountMap[bundleKey as keyof typeof bundleAmountMap] / 100).toFixed(2)}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Display */}
              {selectedAmount && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">GHS {(selectedAmount / 100).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !phone || !bundle}>
                <CreditCard className="mr-2 h-5 w-5" />
                {isLoading ? "Processing..." : "Pay with Paystack"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• MTN Ghana</li>
                <li>• Tigo (AirtelTigo)</li>
                <li>• Telecel Ghana</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Info</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Secure payment via Paystack</li>
                <li>• Instant data delivery</li>
                <li>• 24/7 customer support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
