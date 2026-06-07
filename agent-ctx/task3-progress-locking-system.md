# Task 3 - Progress & Locking System

## Summary
Built the complete Progress & Locking System for the ATT Skill Tree project. All files compile successfully and API endpoints are verified working.

## Files Created

### 1. `/src/app/api/skill-tree/progress/route.ts`
- **GET**: Fetches all progress for guest user with computed stats (totalXpEarned, completedNodes, availableNodes, inProgressNodes) and per-realm progress
- **POST**: Initializes progress records for all nodes
- `ensureInitialProgress()`: Creates UserProgress records for all nodes, first node of each realm starts as "available", others as "locked"

### 2. `/src/app/api/skill-tree/progress/[nodeId]/route.ts`
- **GET**: Get progress for a specific node (by nodeId string like "R1-N1"), includes prerequisite info and auto-unlocks nodes when all prerequisites are completed
- **POST**: Update progress (mark as started, update read percent) — transitions "available" → "in_progress"
- **PUT**: Update quiz score — marks node as "completed" if score >= 60%, triggers `unlockNextNodes()`
- `isFirstNodeInRealm()`: Determines if a node is the first in its realm
- `unlockNextNodes()`: When a node is completed, finds edges with "prerequisite"/"leads_to" relationships and unlocks target nodes if ALL their prerequisites are completed

## Files Updated

### 3. `/src/app/api/skill-tree/quiz/[nodeId]/route.ts`
- Updated POST handler to save progress to UserProgress when quiz is submitted
- If score >= 60%: marks node as completed, awards XP, unlocks next nodes
- Returns `newlyCompleted`, `nodeXpEarned`, `unlockedNodes` in response
- Added shared `unlockNextNodes()` function

### 4. `/src/components/skill-tree/node-view.tsx`
- Fetches progress data from `/api/skill-tree/progress/[nodeId]` on mount
- Shows real XP progress bar (xpEarned / node.xp)
- Shows best quiz score
- If node is "locked": shows locked overlay with prerequisite nodes listed (clickable to navigate)
- If node is "completed": shows green checkmark badge, "Completed" label, "Earned!" on badge
- If node is "in_progress": shows current state
- Auto-marks node as "in_progress" when user opens an "available" node (via ref-tracked POST call)

### 5. `/src/components/skill-tree/realm-view.tsx`
- Fetches progress data from `/api/skill-tree/progress` on mount
- Replaces hardcoded `getNodeStatus()` with real progress data lookup
- Shows completed/available/in_progress/locked states for each node card and dot
- Real progress bar with completed count
- Shows XP earned per realm
- Shows quiz best score on node dots
- Status badges: Completed (green), In Progress (amber), Available (primary), Locked (muted)

### 6. `/src/components/skill-tree/skill-tree-landing.tsx`
- Fetches global progress from `/api/skill-tree/progress` on mount
- Shows total XP earned in stats row
- Shows total nodes completed (e.g., "1/270")
- Per-realm progress bars with real completion counts
- Shows XP earned per realm card
- Overall progress bar when nodes are completed

### 7. `/src/components/skill-tree/quiz-view.tsx`
- Added answer tracking via `answersRef` to collect all answers during the quiz
- Submits answers to the quiz API POST endpoint when the quiz reaches results
- Shows "New Nodes Unlocked!" section when nodes are unlocked after passing
- Properly resets state on quiz retake

## Progress Logic Flow

1. **Initial State**: First node of each realm (R1-N1, R2-N1, etc.) = "available", all others = "locked"
2. **Opening a node**: "available" → auto-transitions to "in_progress" via POST API call
3. **Completing a quiz (≥60%)**: Node status → "completed", XP awarded, next nodes unlocked based on Edge relationships
4. **Unlocking**: When a node is completed, all edges where fromNode = completed node and relationship = "prerequisite" or "leads_to" are checked. Target nodes are unlocked only if ALL their prerequisites are completed.
5. **Best scores**: quizBestScore tracks the best score across retakes

## Build Verification
- `npx next build` compiled successfully
- All API endpoints tested and working via curl
- Progress is correctly persisted to SQLite database
