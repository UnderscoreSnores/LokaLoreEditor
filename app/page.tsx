"use client"

import AdventureWebUI from "../adventure-webui"
import { SessionProvider } from "next-auth/react"

export default function Page() {
  return (
    <SessionProvider>
      <AdventureWebUI />
    </SessionProvider>
  )
}
