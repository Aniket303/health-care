import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const REDIRECT_ON_ERROR = "/auth/login"

function parseRedirectPath(state: string | null, request: NextRequest) {
  if (!state) {
    return "/"
  }

  try {
    const parsed = new URL(state, request.url)
    return parsed.pathname
  } catch {
    return state
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()

  try {
    const params = request.nextUrl.searchParams
    const code = params.get("code")
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")

    if (accessToken && refreshToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    } else if (code) {
      await supabase.auth.exchangeCodeForSession(code)
    }
  } catch (error) {
    console.error(error)
    return NextResponse.redirect(REDIRECT_ON_ERROR)
  }

  const state = request.nextUrl.searchParams.get("state")
  const redirectPath = parseRedirectPath(state, request)

  return NextResponse.redirect(redirectPath)
}
