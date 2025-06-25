'use client'

import React, { createContext, useContext } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'

interface ClerkContextType {
  user: any
  isSignedIn: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  loading: boolean
}

const ClerkContext = createContext<ClerkContextType | undefined>(undefined)

export const useClerkAuth = () => {
  const context = useContext(ClerkContext)
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within a ClerkProvider')
  }
  return context
}

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useAuth()

  // Check if user is admin based on metadata or role
  const isAdmin = user?.publicMetadata?.role === 'admin' || false

  const value = {
    user,
    isSignedIn: isSignedIn || false,
    isAdmin,
    signOut,
    loading: !isLoaded,
  }

  return <ClerkContext.Provider value={value}>{children}</ClerkContext.Provider>
}