import prisma from '@/lib/prisma'
import * as z from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validation = registerSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 })
  }

  const { username, email, password } = validation.data

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
    },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  })

  return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
}
