import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getAdminSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only JPG, PNG, WEBP allowed.` },
          { status: 400 }
        )
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File too large. Max size is 5MB.` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
      const filePath = join(uploadDir, uniqueName)

      // Write file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      uploadedUrls.push(`/uploads/${uniqueName}`)
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 201 })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
// Handles authenticated multi-image uploads with validation and disk persistence.