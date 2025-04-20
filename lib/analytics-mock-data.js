// Collection Categories
const CATEGORIES = ["TECHNICAL", "BUSINESS", "RESEARCH", "LEGAL", "MARKETING", "DESIGN", "FINANCE", "HR"]
const VISIBILITY = ["PRIVATE", "SHARED"]
const ROLES = ["ADMIN", "EDITOR", "VIEWER"]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Generate random number between min and max
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Generate random date within the last year
const randomDate = () => {
  const now = new Date()
  const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  return new Date(pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime()))
}

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split("T")[0]
}

// Generate collection insights data
export const generateCollectionInsights = () => {
  const collections = []

  for (let i = 0; i < 20; i++) {
    collections.push({
      id: `col-${i}`,
      name: `Collection ${i + 1}`,
      pdfCount: randomNumber(5, 100),
      category: CATEGORIES[randomNumber(0, CATEGORIES.length - 1)],
      visibility: VISIBILITY[randomNumber(0, VISIBILITY.length - 1)],
      creatorRole: ROLES[randomNumber(0, ROLES.length - 1)],
      createdAt: randomDate(),
      isFavorite: Math.random() > 0.7,
    })
  }

  return collections
}

// Generate PDF by category data
export const generatePdfsByCategory = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const data = []

  for (let i = 0; i < months.length; i++) {
    const monthData = {
      name: months[i],
    }

    CATEGORIES.forEach((category) => {
      monthData[category] = randomNumber(10, 100)
    })

    data.push(monthData)
  }

  return data
}

// Generate activity over time data
export const generateActivityOverTime = () => {
  const days = 90 // Last 90 days
  const data = []

  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      date: formatDate(date),
      uploads: randomNumber(0, 30),
      views: randomNumber(10, 100),
      edits: randomNumber(0, 20),
    })
  }

  return data
}

// Generate top contributors data
export const generateTopContributors = () => {
  const users = []

  for (let i = 0; i < 10; i++) {
    users.push({
      id: `user-${i}`,
      name: `User ${i + 1}`,
      uploads: randomNumber(10, 100),
      edits: randomNumber(5, 50),
      role: ROLES[randomNumber(0, ROLES.length - 1)],
    })
  }

  return users.sort((a, b) => b.uploads + b.edits - (a.uploads + a.edits))
}

// Generate PDF favorites by role data
export const generatePdfFavoritesByRole = () => {
  return ROLES.map((role) => ({
    name: role,
    value: randomNumber(20, 200),
  }))
}

// Generate collection access types data
export const generateCollectionAccessTypes = () => {
  return [
    { name: "Private", value: randomNumber(50, 200) },
    { name: "Shared - Read Only", value: randomNumber(30, 150) },
    { name: "Shared - Edit", value: randomNumber(20, 100) },
  ]
}

// Generate weekly user activity heatmap data
export const generateWeeklyActivityHeatmap = () => {
  const data = []

  DAYS.forEach((day) => {
    HOURS.forEach((hour) => {
      data.push({
        day,
        hour,
        value: randomNumber(0, 10),
      })
    })
  })

  return data
}

// Generate word cloud data
export const generateWordCloudData = () => {
  const words = [
    "Report",
    "Analysis",
    "Proposal",
    "Contract",
    "Agreement",
    "Research",
    "Study",
    "Plan",
    "Strategy",
    "Budget",
    "Forecast",
    "Review",
    "Summary",
    "Presentation",
    "Manual",
    "Guide",
    "Handbook",
    "Policy",
    "Procedure",
    "Specification",
    "Standard",
    "Template",
    "Form",
    "Checklist",
    "Questionnaire",
    "Survey",
    "Assessment",
    "Evaluation",
    "Audit",
    "Inspection",
    "Investigation",
    "Compliance",
    "Regulation",
    "Requirement",
    "Project",
    "Program",
    "Initiative",
    "Campaign",
    "Launch",
    "Release",
    "Update",
    "Version",
    "Draft",
    "Final",
    "Approved",
    "Confidential",
    "Internal",
    "External",
  ]

  return words.map((word) => ({
    text: word,
    value: randomNumber(10, 100),
  }))
}

// Generate collaboration data
export const generateCollaborationData = () => {
  const teams = []

  for (let i = 0; i < 8; i++) {
    const collaborators = []
    const totalContributions = randomNumber(50, 200)
    let remainingContributions = totalContributions

    // Generate 3-7 collaborators per team
    const numCollaborators = randomNumber(3, 7)
    for (let j = 0; j < numCollaborators; j++) {
      const isLast = j === numCollaborators - 1
      const contribution = isLast ? remainingContributions : randomNumber(5, remainingContributions / 2)
      remainingContributions -= contribution

      collaborators.push({
        id: `user-${j}`,
        name: `User ${j + 1}`,
        contribution,
        accessLevel: Math.random() > 0.5 ? "EDIT" : "READ",
        role: ROLES[randomNumber(0, ROLES.length - 1)],
      })
    }

    teams.push({
      id: `team-${i}`,
      name: `Team ${i + 1}`,
      collectionCount: randomNumber(2, 10),
      collaborators,
      totalContributions,
    })
  }

  return teams
}

// Generate role compliance data
export const generateRoleComplianceData = () => {
  return [
    { role: "ADMIN", compliant: randomNumber(90, 100), total: 100 },
    { role: "EDITOR", compliant: randomNumber(80, 95), total: 100 },
    { role: "VIEWER", compliant: randomNumber(95, 100), total: 100 },
  ]
}

// Generate PDF reuse data
export const generatePdfReuseData = () => {
  const pdfs = []

  for (let i = 0; i < 15; i++) {
    pdfs.push({
      id: `pdf-${i}`,
      name: `Document ${i + 1}.pdf`,
      collections: randomNumber(1, 8),
      views: randomNumber(10, 200),
      downloads: randomNumber(5, 50),
    })
  }

  return pdfs.sort((a, b) => b.collections - a.collections)
}
