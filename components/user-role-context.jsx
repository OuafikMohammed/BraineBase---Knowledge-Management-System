"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Define the user role context
const UserRoleContext = createContext({
  role: "VIEWER",
  setRole: () => {},
  isAdmin: false,
  isEditor: false,
  isViewer: false,
  canCreateCollection: false,
  canEditCollection: (collection) => false,
  canDeleteCollection: (collection) => false,
  canEditPdf: (pdf) => false,
  canDeletePdf: (pdf) => false,
})

export function UserRoleProvider({ children }) {
  const [userRole, setUserRole] = useState("VIEWER")
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    // Load user role and id_profile from localStorage
    const savedRole = localStorage.getItem("userRole") || "VIEWER"
    const savedUserId = localStorage.getItem("userId")

    setUserRole(savedRole)
    if (savedUserId) {
      setUserId(savedUserId)
    }
  }, [])

  const isAdmin = userRole === "ADMIN"
  const isEditor = userRole === "EDITOR"
  const isViewer = userRole === "VIEWER"

  // Permission check functions
  const canCreateCollection = isAdmin || isEditor

  const canEditCollection = (collection) => {
    if (isAdmin) return true
    if (isEditor && collection.created_by === userId) return true
    if (collection.sharedWith) {
      const userShare = collection.sharedWith.find((share) =>
        typeof share === "object"
          ? share.id_profile === userId && share.permission === "EDIT"
          : share === userId
      )
      return !!userShare
    }
    return false
  }

  const canDeleteCollection = (collection) => {
    if (isAdmin) return true
    if (isEditor && collection.created_by === userId) return true
    return false
  }

  const canEditPdf = (pdf) => {
    if (isAdmin) return true
    if (isEditor && pdf.uploaded_by === userId) return true
    return false
  }

  const canDeletePdf = (pdf) => {
    if (isAdmin) return true
    if (isEditor && pdf.uploaded_by === userId) return true
    return false
  }

  // Context value
  const value = {
    role: userRole,
    setRole: (role) => {
      setUserRole(role)
      localStorage.setItem("userRole", role)
    },
    isAdmin,
    isEditor,
    isViewer,
    canCreateCollection,
    canEditCollection,
    canDeleteCollection,
    canEditPdf,
    canDeletePdf,
  }

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  )
}

export const useUserRole = () => {
  const context = useContext(UserRoleContext)
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider")
  }
  return context
}
