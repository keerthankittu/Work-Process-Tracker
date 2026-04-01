# Work Process Tracker

A full-stack, web-based work management system designed to handle complex task dependencies, user role assignments, and process visualization. 

## 🚀 Architecture & Tech Stack
I chose a lightweight, highly readable stack to optimize for development speed, clean logic execution, and zero-configuration testing.
* **Backend:** Python + FastAPI. Chosen for its speed, readable syntax for complex graph algorithms, and auto-generated API documentation.
* **Database:** SQLite + SQLAlchemy ORM. Provides relational data integrity (using strict Enums for status/priority) with zero environment setup required for the reviewer.
* **Frontend:** React (Vite) + Axios. 
* **Visualization:** React Flow to render the Directed Acyclic Graph (DAG) of task dependencies.

## 🧠 Core Logic & Algorithms

### 1. Circular Dependency Prevention (Cycle Detection)
Tasks and their dependencies form a Directed Acyclic Graph (DAG). To prevent infinite blocking loops, the system evaluates every new dependency request before saving it to the database. 
* **Algorithm:** Depth-First Search (DFS).
* **Execution:** When linking Node A (Predecessor) to Node B (Successor), the algorithm traverses downstream starting from Node B. If it encounters Node A during traversal, a cycle is detected, and the API rejects the payload with a `400 Bad Request`.

### 2. The Auto-Unblock Cascade
When a member updates task progress, the backend triggers a cascade evaluation:
* It queries downstream for any tasks waiting on the updated task.
* It evaluates the dependency type (`full` requires 100% completion, `partial` requires hitting a specific integer threshold).
* **Edge Case Handled:** Before unblocking a downstream task, the system verifies that *all* of its upstream dependencies are satisfied, not just the one that triggered the update.

### 3. Edge Case: Zero Threshold
If a dependency threshold is submitted as `0`, it logically implies no dependency exists. The API catches this explicitly at the validation layer and rejects the creation to maintain graph integrity.

## 🛠️ How to Run the Application locally

#### Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install all dependencies at once:
   `pip install -r requirements.txt`
3. Run the server:
   `python -m uvicorn main:app --reload`

### Frontend Setup
1. Open a second terminal and navigate to the frontend folder:
   `cd frontend`
2. Install Node dependencies:
   `npm install`
3. Start the React development server:
   `npm run dev`
4. Open your browser to `http://localhost:5173`.

## 🧑‍💻 User Roles (For Testing)
* **Admin Access:** Create a user with the role `admin` via the API docs to view the global interactive flowchart.
* **Member Access:** Create a user with the role `member` to access the personal dashboard and update assigned task progress.
