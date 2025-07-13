"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function Component() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* GitLab Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-sm flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M12 2L8.5 11h7L12 2z" />
                <path d="M2 11l6.5 0L12 22L2 11z" />
                <path d="M22 11l-6.5 0L12 22L22 11z" />
              </svg>
            </div>
            <span className="text-2xl font-semibold text-gray-800">gitlab.com</span>
          </div>

          <h1 className="text-xl text-gray-700 font-medium">Verifying you are human. This may take a few seconds.</h1>
        </div>

        {/* Verification Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Loading Spinner */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <span className="text-gray-600 font-medium">Verifying{dots}</span>
              </div>

              {/* Cloudflare Logo */}
              <div className="flex items-center space-x-2">
                <div className="text-orange-500 font-bold text-sm">CLOUDFLARE</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Message */}
        <div className="text-center">
          <p className="text-gray-600 text-sm leading-relaxed">
            gitlab.com needs to review the security of your connection before proceeding.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-8">
          <p className="text-xs text-gray-500">Ray ID: 95e8bcd7cd58f9dc</p>
          <p className="text-xs text-gray-500">
            Performance & security by{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Cloudflare
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
