// import {
//   generateCollectionInsights,
//   generatePdfsByCategory,
//   generateActivityOverTime,
//   generateTopContributors,
//   generatePdfFavoritesByRole,
//   generateCollectionAccessTypes,
//   generateWeeklyActivityHeatmap,
//   generateWordCloudData,
//   generateCollaborationData,
//   generateRoleComplianceData,
//   generatePdfReuseData,
// } from "@/lib/analytics-mock-data"

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// // Helper function to fetch data with fallback to mock data
// async function fetchWithFallback(endpoint, mockDataGenerator, params = {}) {
//   try {
//     // Build query string from params
//     const queryParams = new URLSearchParams(params).toString()
//     const url = `${API_URL}${endpoint}${queryParams ? `?${queryParams}` : ""}`

//     console.log(`Fetching from: ${url}`)
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       credentials: "include",
//     })

//     if (!response.ok) {
//       throw new Error(`API returned ${response.status}: ${response.statusText}`)
//     }

//     const data = await response.json()
//     return data.data
//   } catch (error) {
//     console.warn(`Error fetching from API: ${error.message}. Using mock data instead.`)
//     // Return mock data as fallback
//     return mockDataGenerator()
//   }
// }

// // Collection Insights Dashboard
// export const fetchCollectionInsights = (from, to) => {
//   return fetchWithFallback(
//     "/analytics/collection-insights",
//     () => {
//       // Process mock data for collection insights
//       const collections = generateCollectionInsights()
//       const accessTypes = generateCollectionAccessTypes()

//       // Category distribution
//       const categoryDistribution = []
//       const categories = [...new Set(collections.map((c) => c.category))]

//       categories.forEach((category) => {
//         if (!category) return

//         const privateCount = collections.filter((c) => c.category === category && c.visibility === "PRIVATE").length
//         const sharedCount = collections.filter((c) => c.category === category && c.visibility === "SHARED").length

//         categoryDistribution.push({
//           category,
//           private: privateCount,
//           shared: sharedCount,
//           total: privateCount + sharedCount,
//         })
//       })

//       // Visibility distribution
//       const visibilityDistribution = [
//         { name: "Private", value: collections.filter((c) => c.visibility === "PRIVATE").length },
//         { name: "Shared", value: collections.filter((c) => c.visibility === "SHARED").length },
//       ]

//       // Role distribution
//       const roleDistribution = [
//         { name: "Admin", value: collections.filter((c) => c.creatorRole === "ADMIN").length },
//         { name: "Editor", value: collections.filter((c) => c.creatorRole === "EDITOR").length },
//         { name: "Viewer", value: collections.filter((c) => c.creatorRole === "VIEWER").length },
//       ]

//       return {
//         categoryDistribution,
//         visibilityDistribution,
//         roleDistribution,
//         collections,
//       }
//     },
//     { from, to },
//   )
// }

// // Collaboration & Team Participation
// export const fetchCollaborationData = (from, to) => {
//   return fetchWithFallback(
//     "/analytics/collaboration",
//     () => {
//       const collaborationData = generateCollaborationData()

//       return {
//         teams: collaborationData,
//       }
//     },
//     { from, to },
//   )
// }

// // PDF Activity Metrics
// export const fetchPdfActivityMetrics = (from, to) => {
//   return fetchWithFallback(
//     "/analytics/pdf-activity",
//     () => {
//       const pdfsByCategory = generatePdfsByCategory()
//       const topContributors = generateTopContributors()
//       const pdfReuse = generatePdfReuseData().map((pdf) => ({
//         name: pdf.name,
//         value: pdf.collections,
//       }))

//       // Generate favorite vs general use data
//       const favoriteVsGeneral = [
//         { name: "Favorites", value: Math.floor(Math.random() * 100) + 50 },
//         { name: "General Use", value: Math.floor(Math.random() * 200) + 100 },
//       ]

//       return {
//         pdfsByCategory,
//         topContributors,
//         pdfReuse,
//         favoriteVsGeneral,
//       }
//     },
//     { from, to },
//   )
// }

// // User Engagement Heatmap
// export const fetchUserEngagementData = (from, to) => {
//   return fetchWithFallback(
//     "/analytics/user-engagement",
//     () => {
//       const activityHeatmap = generateWeeklyActivityHeatmap()

//       // Generate activity by hour
//       const activityByHour = Array.from({ length: 24 }, (_, hour) => ({
//         hour,
//         logins: Math.floor(Math.random() * 50),
//         uploads: Math.floor(Math.random() * 30),
//         views: Math.floor(Math.random() * 100),
//       }))

//       // Generate activity by day
//       const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
//       const activityByDay = days.map((day) => ({
//         day,
//         logins: Math.floor(Math.random() * 200) + 50,
//         uploads: Math.floor(Math.random() * 100) + 20,
//         views: Math.floor(Math.random() * 300) + 100,
//       }))

//       // Generate activity over time
//       const activityOverTime = []
//       const now = new Date()
//       for (let i = 30; i >= 0; i--) {
//         const date = new Date(now)
//         date.setDate(date.getDate() - i)

//         activityOverTime.push({
//           date: date.toISOString().split("T")[0],
//           logins: Math.floor(Math.random() * 100) + 20,
//           uploads: Math.floor(Math.random() * 50) + 10,
//           views: Math.floor(Math.random() * 200) + 50,
//           edits: Math.floor(Math.random() * 30) + 5,
//         })
//       }

//       return {
//         activityHeatmap,
//         activityByHour,
//         activityByDay,
//         activityOverTime,
//       }
//     },
//     { from, to },
//   )
// }

// // Additional Visualizations
// export const fetchAdditionalVisualizationsData = (from, to) => {
//   return fetchWithFallback(
//     "/analytics/additional",
//     () => {
//       const wordCloud = generateWordCloudData()

//       return {
//         wordCloud,
//       }
//     },
//     { from, to },
//   )
// }

// export const fetchCollaboration = fetchCollaborationData
// export const fetchRoleCompliance = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generateRoleComplianceData())
//     }, 500)
//   })
// }

// export const fetchCollections = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generateCollectionInsights())
//     }, 500)
//   })
// }

// export const fetchCollectionAccessTypes = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generateCollectionAccessTypes())
//     }, 500)
//   })
// }

// export const fetchPdfsByCategory = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generatePdfsByCategory())
//     }, 500)
//   })
// }

// export const fetchActivityOverTime = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generateActivityOverTime())
//     }, 500)
//   })
// }

// export const fetchPdfReuse = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generatePdfReuseData())
//     }, 500)
//   })
// }

// export const fetchTopContributors = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generateTopContributors())
//     }, 500)
//   })
// }

// export const fetchFavoritesByRole = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generatePdfFavoritesByRole())
//     }, 500)
//   })
// }

// export const fetchActivityHeatmap = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generateWeeklyActivityHeatmap())
//     }, 500)
//   })
// }

// export const fetchWordCloud = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(generateWordCloudData())
//     }, 500)
//   })
// }
