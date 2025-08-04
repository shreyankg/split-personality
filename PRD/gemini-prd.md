# Product Requirements Document: Chore Equity App

| **Version** | 1.0 |
|-------------|-----|
| **Date** | August 4, 2025 |
| **Author** | Gemini |

---

## 1. Introduction

This document outlines the product requirements for a new responsive web application designed to help cohabiting partners manage and share household responsibilities more equitably. The core concept is to treat chores not just as tasks to be checked off a list, but as **valuable contributions** to the household. 

By assigning a monetary value to each chore, the app will provide a clear, quantifiable measure of each person's contribution, transforming household labor into a shared financial ledger. This approach aims to:

- 🎯 Foster transparency
- 🤝 Reduce conflict  
- ⚖️ Ensure fair division of labor
- 📱 Provide mobile-first accessibility

---

## 2. Vision & Goal

> **Vision**: To create a more harmonious and equitable living environment for cohabiting individuals by providing a simple, transparent system for valuing and balancing household chores.

### Primary Goals

| Goal | Description |
|------|-------------|
| **🏆 Promote Fairness** | Quantify the value of household work to prevent imbalances and resentment |
| **👁️ Increase Transparency** | Provide a clear, shared view of who is doing what and what it's worth |
| **🤝 Reduce Conflict** | Turn subjective arguments about fairness into objective, data-driven conversations |
| **📋 Simplify Management** | Offer a centralized platform for organizing, tracking, and settling chore-related contributions |

---

## 3. User Personas

### Persona 1: "The Overwhelmed Organizer" - Alex

**👤 Bio**: Alex, 29, works a demanding job and lives with their partner, Jamie. Alex feels they handle the majority of the "invisible labor"—planning meals, scheduling appointments, and remembering to buy supplies—in addition to a significant portion of the physical chores.

**😰 Pain Points**:
- Feels their contributions are taken for granted
- Tired of constantly having to delegate tasks and "manage" the household
- Wants their partner to proactively contribute without being asked
- Finds it difficult to start conversations about chore division without it leading to an argument

**✅ Needs**: A system that automatically highlights the imbalance and shows the real value of all the work they do.

---

### Persona 2: "The Willing but Unaware Contributor" - Jamie

**👤 Bio**: Jamie, 30, has a more flexible work schedule but often gets absorbed in personal projects. Jamie is happy to help around the house but doesn't always see what needs to be done and relies on Alex to point things out.

**😰 Pain Points**:
- Feels like they are being nagged
- Doesn't understand the full scope of what it takes to run the household
- Believes they contribute fairly by handling specific, visible tasks like taking out the trash or mowing the lawn

**✅ Needs**: A clear list of what needs doing and a better understanding of how their contributions compare to their partner's.

---

## 4. Features & Requirements

### 4.1. User Onboarding & Household Setup

**📝 Description**: A simple, low-friction entry point for new users. The initial version will focus on two-person households.

**⚙️ Requirements**:

- ✅ Users can sign up using **only their first name**
- ✅ After signing up, a user can **invite their partner** to join their household via a unique link or code
- ✅ The household is automatically named `<Partner1>-<Partner2>` upon the second person joining (e.g., "Alex-Jamie")
- ✅ The application's architecture must be designed to **accommodate multi-person households** in the future
  - Data should be structured around a `householdId` rather than being tied directly to a pair of users
- ✅ Once a user is part of a household, their view is **scoped to only that household's** chores and data

---

### 4.2. Chore Management

**📝 Description**: The core functionality for creating, assigning, and completing chores.

**⚙️ Requirements**:

- ✅ Users can **create a new chore** with a descriptive name (e.g., "Deep Clean Kitchen")
- ✅ Each chore can be **assigned to a specific person** or left unassigned for anyone to claim
- ✅ Users can **mark a chore as complete**
- ✅ A **history of all completed chores** should be maintained

---

### 4.3. Chore Valuation Engine

**📝 Description**: The system that calculates the monetary value of each completed chore. This is the app's **key differentiator**.

#### 💰 Valuation Formula

```
Chore Value = (Base Rate × Time Spent) + Skill Bonus + Rarity Bonus
```

**⚙️ Requirements**:

#### **💵 Base Rate**
- The app will use the **prevalent minimum wage** of the user's region as the default base rate
- This should be **configurable in household settings** to allow partners to agree on a different rate

#### **⏰ Time Spent**
- When marking a chore as complete, the user must **input the time it took** in hours/minutes

#### **🎯 Skill Level (Skill Bonus)**
When creating a chore, the user can assign a skill level:

| Skill Level | Bonus | Examples |
|-------------|-------|----------|
| **Basic** | No bonus | Wiping a counter |
| **Intermediate** | **+15% bonus** | Cooking a complex meal, assembling furniture |
| **Advanced** | **+30% bonus** | Minor plumbing repair, fixing an appliance |

#### **⭐ Skill Rarity (Rarity Bonus)**
- For each chore, the system will check how many members of the household possess the required skill
- Uses a simple self-declared **"I can do this" checkmark** for each user profile
- If **only one person** in a two-person household has the skill, a **+25% rarity bonus** is applied to the chore's value when they complete it

---

### 4.4. Equity Analysis & Dashboard

**📝 Description**: A clear, visual representation of the household's chore equity.

**⚙️ Requirements**:

- ✅ The dashboard will display a **real-time balance** of who owes whom
- ✅ It will show a **running total** of the monetary value of chores completed by each partner
- ✅ Users can **filter the view** by daily, weekly, and monthly summaries
- ✅ The summary must clearly state the **net result** (e.g., "Jamie owes Alex $45.70 for this week")

---

### 4.5. Debt Settlement

**📝 Description**: Functionality to log when a chore-related debt has been paid.

**⚙️ Requirements**:

- ✅ A **"Settle Up" button** will be visible on the dashboard
- ✅ When clicked, the user who is owed money can **confirm they have received payment**
- ✅ The user must be able to **add a note** about how the debt was settled
  - Examples: "Paid via GPay," "Covered my half of the dinner bill," "Paid in cash"
- ✅ Settling the debt **archives the current balance** and resets the running total to zero
- ✅ The **historical data is preserved** for record-keeping

---

## 5. Design & Technical Considerations

### 🎨 UI/UX

| Aspect | Requirement |
|--------|-------------|
| **📱 Mobile-First** | The interface must be designed for a seamless experience on mobile browsers first, then scaled up for tablet and desktop |
| **✨ Clarity & Simplicity** | The UI should be clean, intuitive, and easy to navigate. The focus should be on making the data easy to understand at a glance |

### 🏗️ Architecture

| Aspect | Requirement |
|--------|-------------|
| **🔄 Scalability** | The backend must be built with a scalable data model that can easily transition from two-person to multi-person households |
| **🗄️ Database** | Use of a flexible database schema (e.g., NoSQL) is recommended to accommodate future feature additions |

---

## 6. Future Considerations (Out of Scope for V1)

The following features are **not included in V1** but should be considered for future releases:

### 🔮 Future Features

| Feature | Description |
|---------|-------------|
| **👤 Full User Account Management** | Email/password login, profile pictures, etc. |
| **👥 Multi-Person Households** | Support for 3+ people, with a more complex balance sheet |
| **🔄 Recurring Chores** | Ability to schedule chores to repeat daily, weekly, or monthly |
| **💳 Payment Integration** | Direct integration with payment platforms like Stripe, PayPal, or Google Pay to facilitate debt settlement |
| **🤖 Chore Suggestions** | An AI-powered feature that suggests chores based on household history |
| **📊 Advanced Reporting** | More detailed analytics and exportable reports |

---

## 📋 Implementation Checklist

- [ ] User onboarding with first name only
- [ ] Household creation and joining via invite codes
- [ ] Chore creation, assignment, and completion
- [ ] Chore valuation engine with skill and rarity bonuses
- [ ] Real-time equity dashboard with period filters
- [ ] Debt settlement with payment notes
- [ ] Mobile-first responsive design
- [ ] Scalable architecture for future expansion

---

*This PRD serves as the foundation for building a fair, transparent, and user-friendly household chore management system.*