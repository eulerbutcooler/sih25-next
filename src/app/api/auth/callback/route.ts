import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db'
import { users } from '@/utils/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check if user already exists in our database
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.supabaseId, user.id))
        .limit(1)

      // If user doesn't exist in our DB, create them (this happens after email confirmation)
      if (!existingUser) {
        try {
          const { data: userData } = await supabase.auth.getUser()
          const userMetadata = userData.user?.user_metadata || {}
          
          await db.insert(users).values({
            supabaseId: user.id,
            fullName: userMetadata.full_name || user.email?.split('@')[0] || 'User',
            email: user.email!,
            role: userMetadata.role || 'citizen',
            organization: userMetadata.organization || null,
            username: user.email!.split('@')[0],
          })
        } catch (dbError) {
          console.error('Error creating user in database:', dbError)
          // Don't fail the auth flow, just log the error
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/register?error=auth-callback-error`)
}
