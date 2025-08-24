import { supabase } from './supabase'
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js'

// Authentication utilities and types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  emailConfirmed: boolean
}

export interface AuthState {
  user: User | null
  loading: boolean
}

// Transform Supabase user to our User interface
function transformSupabaseUser(supabaseUser: SupabaseUser, userData?: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    firstName: userData?.first_name || '',
    lastName: userData?.last_name || '',
    emailConfirmed: supabaseUser.email_confirmed_at !== null,
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Get additional user data from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user data:', userError)
      }

      return {
        user: transformSupabaseUser(data.user, userData),
      }
    }

    return { error: 'Sign in failed' }
  } catch (error) {
    console.error('Sign in error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Sign up with email, password, and user details
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<{ user?: User; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // The user profile will be automatically created by the database trigger
      // No need to manually insert into the users table
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          firstName: firstName,
          lastName: lastName,
          emailConfirmed: false, // Always false for new sign-ups
        },
      }
    }

    return { error: 'Sign up failed' }
  } catch (error) {
    console.error('Sign up error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error('Password reset error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Confirm email with token
export async function confirmEmail(token: string): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error('Email confirmation error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Sign out
export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Get current session
export async function getCurrentUser(): Promise<{ user?: User; error?: string }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return { error: error.message }
    }

    if (session?.user) {
      // Get additional user data from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user data:', userError)
      }

      return {
        user: transformSupabaseUser(session.user, userData),
      }
    }

    return {}
  } catch (error) {
    console.error('Get current user error:', error)
    return { error: 'An unexpected error occurred' }
  }
}
